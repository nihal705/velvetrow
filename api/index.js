import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import connectDB from "../server/config/db.js";
import showRouter from "../server/routes/showRoutes.js";
import bookingRouter from "../server/routes/bookingRoutes.js";
import adminRouter from "../server/routes/adminRoutes.js";
import userRouter from "../server/routes/userRoutes.js";
import { razorpayWebhook } from "../server/controllers/razorpayWebhook.js";

dotenv.config();
const app = express();

// Connect to Database
connectDB();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://velvetrow.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("❌ CORS blocked origin:", origin);
      callback(null, true); 
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  exposedHeaders: ["Content-Length", "X-Requested-With"],
  maxAge: 86400,
};

app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

app.post(
  "/api/razorpay-webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
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

export default app;