import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "../config/db.js";
import { syncExternalJobs } from "../services/jobSyncService.js";

await connectDB();
const result = await syncExternalJobs();
console.log("External job sync complete:", result);
process.exit(0);
