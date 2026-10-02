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

export const checkInTicket = async (req, res) => {
  try {
    const { ticketId } = req.body;
    if (typeof ticketId !== "string" || !/^[a-f\d]{48}$/i.test(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "This QR code is not a valid VelvetRow ticket.",
      });
    }

    const booking = await Booking.findOne({ "tickets.ticketId": ticketId })
      .populate({
        path: "show",
        populate: { path: "movie" },
      });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }
    if (!booking.isPaid) {
      return res.status(409).json({
        success: false,
        message: "This ticket has not been paid for.",
      });
    }

    const ticket = booking.tickets.find((item) => item.ticketId === ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found." });
    }
    if (ticket.checkedInAt) {
      return res.status(409).json({
        success: false,
        message: `This ticket was already used at ${ticket.checkedInAt.toISOString()}.`,
      });
    }

    const showStart = new Date(booking.show.showDateTime);
    const runtimeMinutes = booking.show.movie?.runtime || 120;
    const validFrom = new Date(showStart.getTime() - 60 * 60 * 1000);
    const validUntil = new Date(showStart.getTime() + runtimeMinutes * 60 * 1000);
    const now = new Date();
    if (now < validFrom || now > validUntil) {
      return res.status(410).json({
        success: false,
        message: `Ticket is valid from ${validFrom.toISOString()} until ${validUntil.toISOString()}.`,
      });
    }

    const updatedBooking = await Booking.findOneAndUpdate(
      {
        _id: booking._id,
        isPaid: true,
        tickets: { $elemMatch: { ticketId, checkedInAt: null } },
      },
      { $set: { "tickets.$.checkedInAt": now } },
      { new: true },
    ).populate({
      path: "show",
      populate: { path: "movie" },
    });
    if (!updatedBooking) {
      return res.status(409).json({
        success: false,
        message: "This ticket has already been used.",
      });
    }

    res.json({
      success: true,
      message: "Ticket checked in successfully.",
      ticket: {
        movie: updatedBooking.show.movie?.title,
        theaterName: updatedBooking.show.theaterName,
        seat: ticket.seat,
        showDateTime: updatedBooking.show.showDateTime,
        validUntil,
        checkedInAt: now,
      },
    });
  } catch (error) {
    console.error("Ticket check-in failed:", error);
    res.status(500).json({
      success: false,
      message: "Unable to verify ticket right now. Please try again.",
    });
  }
};

export const updateShowVenue = async (req, res) => {
  try {
    const { showId } = req.params;
    const { theaterName, theaterAddress, theaterMapUrl = "" } = req.body;

    if (
      typeof theaterName !== "string" ||
      !theaterName.trim() ||
      typeof theaterAddress !== "string" ||
      !theaterAddress.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter the theater name and address.",
      });
    }
    if (theaterMapUrl && !/^https?:\/\/[^\s]+$/i.test(theaterMapUrl)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid theater map URL.",
      });
    }

    const show = await Show.findByIdAndUpdate(
      showId,
      {
        theaterName: theaterName.trim(),
        theaterAddress: theaterAddress.trim(),
        theaterMapUrl: theaterMapUrl.trim(),
      },
      { new: true, runValidators: true },
    );
    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found.",
      });
    }

    res.json({ success: true, show });
  } catch (error) {
    console.error("Failed to update show venue:", error);
    res.status(500).json({
      success: false,
      message: "Unable to update theater details right now.",
    });
  }
};