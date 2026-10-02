import { inngest } from "../inngest/index.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import {
  expirePendingBooking,
  expirePendingBookings,
  PENDING_BOOKING_TTL_MS,
  releaseBookingSeats,
} from "../utils/bookingCleanup.js";

// Function to check availability of selected seats for a movie
const checkSeatsAvailability = async (showId, selectedSeats) => {
  const showData = await Show.findById(showId);
  if (!showData) {
    return false;
  }

  const occupiedSeats = showData.occupiedSeats || {};
  return !selectedSeats.some((seat) => occupiedSeats[seat]);
};

export const createBooking = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { showId, selectedSeats } = req.body;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Sign in to book tickets." });
    }
    if (
      !showId ||
      !Array.isArray(selectedSeats) ||
      selectedSeats.length === 0 ||
      selectedSeats.length > 5 ||
      selectedSeats.some((seat) => typeof seat !== "string") ||
      new Set(selectedSeats).size !== selectedSeats.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Select between one and five unique seats.",
      });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({
        success: false,
        message: "Razorpay is not configured on the server.",
      });
    }

    await expirePendingBookings({ show: showId });

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
      tickets: selectedSeats.map((seat) => ({
        seat,
        ticketId: crypto.randomBytes(24).toString("hex"),
      })),
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
      try {
        await releaseBookingSeats(booking);
        await Booking.findByIdAndDelete(booking._id);
      } catch (cleanupError) {
        console.error("Failed to roll back unsuccessful booking:", cleanupError);
      }
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
      console.error("Failed to schedule pending booking expiry:", error);
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
    const isRazorpayAuthError = error.statusCode === 401;
    res.status(isRazorpayAuthError ? 502 : 500).json({
      success: false,
      message: isRazorpayAuthError
        ? "Razorpay authentication failed. Check that the production key ID and secret match and use the same Razorpay mode."
        : error.error?.description || error.message,
    });
  }
};

export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;

    await expirePendingBookings({ show: showId });
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

export const getPendingCheckout = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { bookingId } = req.params;
    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId,
      isPaid: false,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Pending booking not found. It may already be paid or cancelled.",
      });
    }

    if (Date.now() - booking.createdAt.getTime() >= PENDING_BOOKING_TTL_MS) {
      await expirePendingBooking(booking);
      return res.status(410).json({
        success: false,
        message: "This booking expired. Please select the seats again.",
      });
    }

    if (!booking.razorpayOrderId || !process.env.RAZORPAY_KEY_ID) {
      return res.status(503).json({
        success: false,
        message: "Payment is not available for this booking. Please cancel it and try again later.",
      });
    }

    res.json({
      success: true,
      orderId: booking.razorpayOrderId,
      amount: booking.amount * 100,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID,
      bookingId: booking._id,
    });
  } catch (error) {
    console.error("❌ Pending checkout error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { bookingId } = req.params;
    const booking = await Booking.findOneAndDelete({
      _id: bookingId,
      user: userId,
      isPaid: false,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Pending booking not found. Paid bookings cannot be cancelled here.",
      });
    }

    await releaseBookingSeats(booking);
    res.json({ success: true, message: "Booking cancelled and seats released." });
  } catch (error) {
    console.error("❌ Booking cancellation error:", error);
    res.status(500).json({ success: false, message: error.message });
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

    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.auth.userId,
      razorpayOrderId: razorpay_order_id,
    });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Pending booking not found for this payment.",
      });
    }
    if (booking.isPaid && booking.razorpayPaymentId === razorpay_payment_id) {
      return res.json({ success: true, message: "Payment already verified." });
    }
    if (booking.isPaid) {
      return res.status(409).json({
        success: false,
        message: "This booking has already been paid with a different payment.",
      });
    }

    // Verify the payment signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(503).json({
        success: false,
        message: "Payment verification is not configured on the server.",
      });
    }
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");
    const expectedSignatureBuffer = Buffer.from(expectedSignature, "hex");
    const receivedSignatureBuffer = Buffer.from(razorpay_signature || "", "hex");

    if (
      expectedSignatureBuffer.length !== receivedSignatureBuffer.length ||
      !crypto.timingSafeEqual(expectedSignatureBuffer, receivedSignatureBuffer)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Update booking status to paid
    const updatedBooking = await Booking.findOneAndUpdate({
      _id: bookingId,
      user: req.auth.userId,
      isPaid: false,
      razorpayOrderId: razorpay_order_id,
    }, {
      isPaid: true,
      paidAt: new Date(),
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      paymentLink: "",
    });
    if (!updatedBooking) {
      return res.status(409).json({
        success: false,
        message: "The booking changed before payment confirmation. Contact support with your Razorpay payment ID.",
      });
    }

    // Try Inngest but don't fail if it doesn't work
    try {
      await inngest.send({
        name: "app/show.booked",
        data: { bookingId },
      });
    } catch (error) {
      console.error("Failed to schedule booking confirmation:", error);
    }

    res.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    res.json({ success: false, message: error.message });
  }
};
