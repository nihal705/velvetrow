import express from "express";
import { protectAdmin } from "../middleware/auth.js";
import {
  getAllBookings,
  getAllShows,
  getDashboardData,
  isAdmin,
  checkInTicket,
  updateShowVenue,
} from "../controllers/adminController.js";

const adminRouter = express.Router();

adminRouter.get("/is-admin", protectAdmin, isAdmin);
adminRouter.get("/dashboard", protectAdmin, getDashboardData);
adminRouter.get("/all-shows", protectAdmin, getAllShows);
adminRouter.get("/all-bookings", protectAdmin, getAllBookings);
adminRouter.post("/check-in", protectAdmin, checkInTicket);
adminRouter.patch("/:showId/venue", protectAdmin, updateShowVenue);

export default adminRouter;
