import { clerkClient } from "@clerk/clerk-sdk-node"; // ← FIXED: changed import
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";
import { expirePendingBookings } from "../utils/bookingCleanup.js";
import crypto from "crypto";

// API Controller Function to Get User Bookings
export const getUserBookings = async (req, res) => {
  try {
    const user = req.auth.userId; // ← FIXED: removed parentheses

    await expirePendingBookings({ user });
    const bookings = await Booking.find({ user })
      .populate({
        path: "show",
        populate: { path: "movie" },
      })
      .sort({ createdAt: -1 });

    for (const booking of bookings) {
      if (booking.isPaid && booking.tickets.length !== booking.bookedSeats.length) {
        const existingSeats = new Set(booking.tickets.map((ticket) => ticket.seat));
        booking.bookedSeats.forEach((seat) => {
          if (!existingSeats.has(seat)) {
            booking.tickets.push({
              seat,
              ticketId: crypto.randomBytes(24).toString("hex"),
            });
          }
        });
        await booking.save();
      }
    }

    res.json({ success: true, bookings });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API Controller Function to Update Favorite Movie in Clerk User Metadata
export const updateFavorite = async (req, res) => {
  try {
    const { movieId } = req.body;
    const userId = req.auth.userId; // ← FIXED: removed parentheses

    const user = await clerkClient.users.getUser(userId);

    if (!user.privateMetadata.favorites) {
      user.privateMetadata.favorites = [];
    }

    if (!user.privateMetadata.favorites.includes(movieId)) {
      user.privateMetadata.favorites.push(movieId);
    } else {
      user.privateMetadata.favorites = user.privateMetadata.favorites.filter(
        (item) => item !== movieId
      );
    }

    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: user.privateMetadata,
    });

    res.json({ success: true, message: "Favorite movies updated" });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API Controller Function to Get Favorite Movies from Clerk User Metadata
export const getFavorites = async (req, res) => {
  try {
    const user = await clerkClient.users.getUser(req.auth.userId); // ← FIXED
    const favorites = user.privateMetadata.favorites || [];

    // Getting movies from database
    const movies = await Movie.find({ _id: { $in: favorites } });

    res.json({ success: true, movies });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};