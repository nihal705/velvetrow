import express from "express";
import {
  createBooking,
  cancelBooking,
  getPendingCheckout,
  getOccupiedSeats,
  verifyPayment,
} from "../controllers/bookingController.js";

const bookingRouter = express.Router();

// Route to create a new booking and Razorpay order
bookingRouter.post("/create", createBooking);
bookingRouter.get("/:bookingId/checkout", getPendingCheckout);
bookingRouter.delete("/:bookingId", cancelBooking);

// Route to verify Razorpay payment
bookingRouter.post("/verify-payment", verifyPayment);

// Route to get occupied seats for a show
bookingRouter.get("/seats/:showId", getOccupiedSeats);

export default bookingRouter;