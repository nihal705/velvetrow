import crypto from "crypto";
import Booking from "../models/Booking.js";
import { inngest } from "../inngest/index.js";

export const razorpayWebhook = async (request, response) => {
  try {
    const razorpaySignature = request.headers["x-razorpay-signature"];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("Razorpay webhook secret is not configured.");
      return response.status(503).json({
        success: false,
        message: "Webhook secret is not configured.",
      });
    }

    const body = Buffer.isBuffer(request.body)
      ? request.body
      : JSON.stringify(request.body);

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    const suppliedSignature = Buffer.from(razorpaySignature || "", "hex");
    const expectedSignatureBuffer = Buffer.from(expectedSignature, "hex");
    if (
      suppliedSignature.length !== expectedSignatureBuffer.length ||
      !crypto.timingSafeEqual(expectedSignatureBuffer, suppliedSignature)
    ) {
      return response.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    const event = Buffer.isBuffer(request.body)
      ? JSON.parse(request.body.toString("utf8"))
      : request.body;

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
        const booking = await Booking.findOneAndUpdate({
          _id: bookingId,
          razorpayOrderId: payment.order_id,
          isPaid: false,
        }, {
          isPaid: true,
          razorpayPaymentId: payment.id,
          razorpayOrderId: payment.order_id,
          paymentLink: "",
        });

        if (booking) {
          await inngest.send({
            name: "app/show.booked",
            data: { bookingId },
          });
        }

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
