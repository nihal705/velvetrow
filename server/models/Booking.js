import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    seat: { type: String, required: true },
    ticketId: { type: String, required: true },
    checkedInAt: { type: Date, default: null },
  },
  { _id: false },
);

const bookingSchema = new mongoose.Schema(
  {
    user: { type: String, required: true, ref: "User" },
    show: { type: String, required: true, ref: "Show" },
    amount: { type: Number, required: true },
    bookedSeats: { type: Array, required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date, default: null },
    paymentLink: { type: String }, 
    razorpayOrderId: { type: String }, 
    razorpayPaymentId: { type: String }, 
    tickets: { type: [ticketSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);