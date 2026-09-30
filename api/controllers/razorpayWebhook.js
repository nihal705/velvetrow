import crypto from "crypto";
import Booking from "../models/Booking.js";
import { inngest } from "../inngest/index.js";

export const razorpayWebhook = async (request, response) => {
  try {
    // Get the webhook signature from headers
    const razorpaySignature = request.headers["x-razorpay-signature"];

    // Verify the webhook signature
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const body = JSON.stringify(request.body);

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return response.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    // Process the webhook event
    const event = request.body;

    switch (event.event) {
      case "payment.captured": {
        const payment = event.payload.payment.entity;
        const { notes } = payment;
        const { bookingId } = notes;

        if (!bookingId) {
          console.error("No booking ID found in payment notes");
          break;
        }

        // Update booking status to paid
        await Booking.findByIdAndUpdate(bookingId, {
          isPaid: true,
          razorpayPaymentId: payment.id,
          razorpayOrderId: payment.order_id,
          paymentLink: "",
        });

        // Send Confirmation Email via Inngest
        await inngest.send({
          name: "app/show.booked",
          data: { bookingId },
        });

        break;
      }

      case "payment.failed": {
        const payment = event.payload.payment.entity;
        const { notes } = payment;
        const { bookingId } = notes;

        if (bookingId) {
          // You can optionally handle failed payments here
        }
        break;
      }

      default:
    }

    response.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    response.status(500).send("Internal Server Error");
  }
};
