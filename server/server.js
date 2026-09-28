import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import connectDB from "./configs/db.js";
import showRouter from "./routes/showRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import userRouter from "./routes/userRoutes.js";
import { razorpayWebhook } from "./controllers/razorpayWebhook.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Connect to Database
await connectDB();

// ✅ CORS Configuration - ADD THIS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://velvetrow.vercel.app",
  process.env.FRONTEND_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// Razorpay Webhook (must come before express.json())
app.post(
  "/api/razorpay-webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook,
);

// Middleware
app.use(express.json());
app.use(clerkMiddleware());

// Routes
app.use("/api/show", showRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  res.send("Server is live");
});

app.listen(port, () => {});
