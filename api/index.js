import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import connectDB from "./_lib/config/db.js";
import showRouter from "./_lib/routes/showRoutes.js";
import bookingRouter from "./_lib/routes/bookingRoutes.js";
import adminRouter from "./_lib/routes/adminRoutes.js";
import userRouter from "./_lib/routes/userRoutes.js";
import { razorpayWebhook } from "./_lib/controllers/razorpayWebhook.js";

dotenv.config();
const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://velvetrow.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
}));

app.options("*", cors());

app.get("/", (req, res) => res.send("Server is live"));

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection error:", error.message);
    res.status(503).json({ success: false, message: "Database unavailable" });
  }
});

app.post("/api/razorpay-webhook", express.raw({ type: "application/json" }), razorpayWebhook);

app.use(express.json());
app.use(clerkMiddleware());

app.use("/api/show", showRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

export default app;