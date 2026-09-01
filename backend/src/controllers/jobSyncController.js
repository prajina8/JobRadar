import { syncExternalJobs } from "../services/jobImporter.js";

export async function syncJobs(req, res) {
  try {
    const result = await syncExternalJobs();

    res.json({
      message: "External jobs synchronized successfully",
      ...result,
    });
  } catch (error) {
    console.error("Job sync error:", error);

    res.status(500).json({
      message: "Failed to synchronize external jobs",
      error: error.message,
    });
  }
}