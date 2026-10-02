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
      return false;
    }

    // Make sure occupiedSeats exists
    const occupiedSeats = showData.occupiedSeats || {};

    const isAnySeatTaken = selectedSeats.some((seat) => occupiedSeats[seat]);

    return !isAnySeatTaken;
  } catch (error) {
    return false;
  }
};

const rollbackFailedBooking = async ({
  showId,
  bookingId,
  selectedSeats,
  userId,
}) => {
  const cleanupResults = await Promise.allSettled([
    (async () => {
      const show = await Show.findById(showId);
      if (!show) {
        throw new Error(`Show ${showId} was not found during booking rollback.`);
      }

      let seatsChanged = false;
      selectedSeats.forEach((seat) => {
        if (show.occupiedSeats?.[seat] === userId) {
          delete show.occupiedSeats[seat];
          seatsChanged = true;
        }
      });

      if (seatsChanged) {
        show.markModified("occupiedSeats");
        await show.save();
      }
    })(),
    Booking.findByIdAndDelete(bookingId),
  ]);

  cleanupResults.forEach((result, index) => {
    if (result.status === "rejected") {
      const action = index === 0 ? "release reserved seats" : "delete booking";
      console.error(`Failed to ${action} during booking rollback:`, result.reason);
    }
  });
};

export const createBooking = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { showId, selectedSeats } = req.body;
    const { origin } = req.headers;

    // Check if the seat is available for the selected show
    const isAvailable = await checkSeatsAvailability(showId, selectedSeats);

    if (!isAvailable) {
      return res.json({
        success: false,
        message: "Selected Seats are not available.",
      });
    }

    // Get the show details
    const showData = await Show.findById(showId).populate("movie");
    if (!showData) {
      return res.json({
        success: false,
        message: "Show not found.",
      });
    }

    // Create a new booking
    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: showData.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats,
    });

    // Reserve seats
    selectedSeats.forEach((seat) => {
      showData.occupiedSeats[seat] = userId;
    });

    showData.markModified("occupiedSeats");
    await showData.save();

    // ---------- RAZORPAY INTEGRATION ----------
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

    let order;
    try {
      const razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      order = await razorpayInstance.orders.create(options);

      // Store order ID in booking
      booking.razorpayOrderId = order.id;
      booking.paymentLink = null;
      await booking.save();
    } catch (error) {
      await rollbackFailedBooking({
        showId,
        bookingId: booking._id,
        selectedSeats,
        userId,
      });
      throw error;
    }

    // Try Inngest but don't fail if it doesn't work
    try {
      await inngest.send({
        name: "app/checkpayment",
        data: {
          bookingId: booking._id.toString(),
        },
      });
    } catch (error) {
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

    const showData = await Show.findById(showId);
    if (!showData) {
      return res.json({ success: false, message: "Show not found" });
    }

    const occupiedSeats = Object.keys(showData.occupiedSeats || {});

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

    // Verify the payment signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
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

    // Try Inngest but don't fail if it doesn't work
    try {
      await inngest.send({
        name: "app/show.booked",
        data: { bookingId },
      });
    } catch (error) {}

    res.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    res.json({ success: false, message: error.message });
  }
};
