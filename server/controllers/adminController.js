import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import User from "../models/User.js";
import { expirePendingBookings } from "../utils/bookingCleanup.js";

// API to check if user is an admin
export const isAdmin = async (req, res) => {
  res.json({ success: true, isAdmin: true });
};

// API to get dashboard data
export const getDashboardData = async (req, res) => {
  try {
    const bookings = await Booking.find({ isPaid: true });
    const activeShows = await Show.find({
      showDateTime: { $gte: new Date() },
    }).populate("movie");

    const totalUser = await User.countDocuments();

    const dashboardData = {
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((acc, booking) => acc + booking.amount, 0),
      activeShows,
      totalUser,
    };

    res.json({ success: true, dashboardData });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all shows
export const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find({ showDateTime: { $gte: new Date() } })
      .populate("movie")
      .sort({ showDateTime: 1 });

    const paidBookings = await Booking.find({
      show: { $in: shows.map((show) => show._id) },
      isPaid: true,
    }).select("show amount");
    const paidByShow = new Map();
    paidBookings.forEach((booking) => {
      const showId = booking.show.toString();
      const totals = paidByShow.get(showId) || { bookings: 0, revenue: 0 };
      totals.bookings += 1;
      totals.revenue += booking.amount;
      paidByShow.set(showId, totals);
    });
    const showsWithTotals = shows.map((show) => ({
      ...show.toObject(),
      totalBookings: paidByShow.get(show._id.toString())?.bookings || 0,
      totalRevenue: paidByShow.get(show._id.toString())?.revenue || 0,
    }));

    res.json({ success: true, shows: showsWithTotals });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all bookings
export const getAllBookings = async (req, res) => {
  try {
    await expirePendingBookings({});
    const bookings = await Booking.find({})
      .populate("user")
      .populate({
        path: "show",
        populate: { path: "movie" },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};