import dotenv from "dotenv";
dotenv.config();

import path from "path";
import { fileURLToPath } from "url";

import express from "express";

import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { connectDB } from "./src/config/db.js";
import { syncExternalJobs } from "./src/services/jobImporter.js";
import { deactivateExpiredJobs } from "./src/services/jobExpiry.js";



import authRoutes from "./src/routes/authRoutes.js";
import jobRoutes from "./src/routes/jobRoutes.js";
import applicationRoutes from "./src/routes/applicationRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));


app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "..", "uploads"))
);

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