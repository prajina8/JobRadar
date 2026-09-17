import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import { syncExternalJobs } from "./services/jobImporter.js";
import { deactivateExpiredJobs } from "./services/jobExpiry.js";



import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.get("/api/health", (_req, res) => res.json({ ok: true, message: "SmartJob API is running" }));

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);

app.use((_req, res) => res.status(404).json({ message: "Route not found" }));

const port = process.env.PORT || 5000;




const SYNC_INTERVAL_MS = Number(process.env.JOB_SYNC_INTERVAL_HOURS || 6) * 60 * 60 * 1000;
const EXPIRY_SWEEP_MS = 60 * 60 * 1000; // check for expired listings every hour

connectDB().then(() => {
  // Run once at boot, then keep re-syncing automatically so new external
  // listings keep flowing in without anyone triggering it by hand.
  // .catch here is a last line of defense — syncExternalJobs already
  // catches per-job errors internally, but this ensures nothing it does
  // can ever crash the process via an unhandled promise rejection.
  const runSync = () => syncExternalJobs().catch((err) => console.error("Job sync failed:", err.message));
  const runSweep = () => deactivateExpiredJobs().catch((err) => console.error("Expiry sweep failed:", err.message));

  runSync();
  setInterval(runSync, SYNC_INTERVAL_MS);
  setInterval(runSweep, EXPIRY_SWEEP_MS);

  app.listen(port, () => console.log(`SmartJob server running on port ${port}`));
}).catch((err) => {
  console.error("Database startup failed:", err.message);
  process.exit(1);
});