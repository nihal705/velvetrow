import { inngest } from "../inngest/index.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import Razorpay from "razorpay";
import crypto from "crypto";

// Function to check availability of selected seats for a movie
const checkSeatsAvailability = async (showId, selectedSeats) => {
  try {
    const showData = await Show.findById(showId);
    if (!showData) {
      console.log("❌ Show not found:", showId);
      return false;
    }

    // Make sure occupiedSeats exists
    const occupiedSeats = showData.occupiedSeats || {};

    const isAnySeatTaken = selectedSeats.some((seat) => occupiedSeats[seat]);

    return !isAnySeatTaken;
  } catch (error) {
    console.log("❌ checkSeatsAvailability error:", error.message);
    return false;
  }
};

export const createBooking = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { showId, selectedSeats } = req.body;
    const { origin } = req.headers;

    console.log("📝 Creating booking for showId:", showId);
    console.log("📝 Selected seats:", selectedSeats);
    console.log("📝 User ID:", userId);

    // Check if the seat is available for the selected show
    const isAvailable = await checkSeatsAvailability(showId, selectedSeats);

    if (!isAvailable) {
      console.log("❌ Seats not available");
      return res.json({
        success: false,
        message: "Selected Seats are not available.",
      });
    }

    // Get the show details
    const showData = await Show.findById(showId).populate("movie");
    if (!showData) {
      console.log("❌ Show not found in database:", showId);
      return res.json({
        success: false,
        message: "Show not found.",
      });
    }

    console.log("✅ Show found:", showData._id);
    console.log("✅ Movie:", showData.movie?.title);

    // Create a new booking
    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: showData.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats,
    });

    console.log("✅ Booking created:", booking._id);

    // Reserve seats
    selectedSeats.forEach((seat) => {
      showData.occupiedSeats[seat] = userId;
    });

    showData.markModified("occupiedSeats");
    await showData.save();

    console.log("✅ Seats reserved successfully");

    // ---------- RAZORPAY INTEGRATION ----------
    const razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Create Razorpay Order
    const options = {
      amount: booking.amount * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_${booking._id}`,
      payment_capture: 1,
      notes: {
        bookingId: booking._id.toString(),
        userId: userId,
        showId: showId,
      },
    };

    const order = await razorpayInstance.orders.create(options);
    console.log("✅ Razorpay order created:", order.id);

    // Store order ID in booking
    booking.razorpayOrderId = order.id;
    booking.paymentLink = null;
    await booking.save();

    // Try Inngest but don't fail if it doesn't work
    try {
      await inngest.send({
        name: "app/checkpayment",
        data: {
          bookingId: booking._id.toString(),
        },
      });
      console.log("✅ Inngest event sent");
    } catch (error) {
      console.log("⚠️ Inngest error:", error.message);
      // Continue without Inngest
    }

    // Send response with Razorpay order details
    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      bookingId: booking._id,
    });
  } catch (error) {
    console.error("❌ Booking error:", error);
    res.json({ success: false, message: error.message });
  }
};

export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    console.log("🔍 Getting occupied seats for showId:", showId);

    const showData = await Show.findById(showId);
    if (!showData) {
      console.log("❌ Show not found:", showId);
      return res.json({ success: false, message: "Show not found" });
    }

    const occupiedSeats = Object.keys(showData.occupiedSeats || {});
    console.log("✅ Occupied seats:", occupiedSeats);

    res.json({ success: true, occupiedSeats });
  } catch (error) {
    console.error("❌ getOccupiedSeats error:", error);
    res.json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    console.log("🔍 Verifying payment for booking:", bookingId);

    // Verify the payment signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.log("❌ Invalid payment signature");
      return res.json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Update booking status to paid
    await Booking.findByIdAndUpdate(bookingId, {
      isPaid: true,
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      paymentLink: "",
    });

    console.log("✅ Payment verified and booking updated");

    // Try Inngest but don't fail if it doesn't work
    try {
      await inngest.send({
        name: "app/show.booked",
        data: { bookingId },
      });
      console.log("✅ Inngest booking confirmation sent");
    } catch (error) {
      console.log("⚠️ Inngest error:", error.message);
    }

    res.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    res.json({ success: false, message: error.message });
  }
};