import Booking from "../models/Booking.js";
import Show from "../models/Show.js";

export const PENDING_BOOKING_TTL_MS = 10 * 60 * 1000;

export const releaseBookingSeats = async (booking) => {
  const show = await Show.findById(booking.show);
  if (!show) {
    throw new Error(`Show ${booking.show} was not found while releasing seats.`);
  }

  let seatsChanged = false;
  booking.bookedSeats.forEach((seat) => {
    if (show.occupiedSeats?.[seat] === booking.user) {
      delete show.occupiedSeats[seat];
      seatsChanged = true;
    }
  });

  if (seatsChanged) {
    show.markModified("occupiedSeats");
    await show.save();
  }
};

export const expirePendingBooking = async (booking) => {
  const cutoff = new Date(Date.now() - PENDING_BOOKING_TTL_MS);
  const expiredBooking = await Booking.findOneAndDelete({
    _id: booking._id,
    user: booking.user,
    isPaid: false,
    createdAt: { $lte: cutoff },
  });

  if (!expiredBooking) {
    return false;
  }

  await releaseBookingSeats(expiredBooking);
  return true;
};

export const expirePendingBookings = async (filter) => {
  const cutoff = new Date(Date.now() - PENDING_BOOKING_TTL_MS);
  const expiredBookings = await Booking.find({
    ...filter,
    isPaid: false,
    createdAt: { $lte: cutoff },
  });

  for (const booking of expiredBookings) {
    await expirePendingBooking(booking);
  }
};
