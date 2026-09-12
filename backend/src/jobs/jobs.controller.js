import { fetchJobs } from "../integrations/adzuna.js";

async function getJobs(req, res) {
  try {
    const { query, page } = req.query;

    const jobs = await fetchJobs(query, page);

    res.json(jobs);
  } catch (err) {
    console.error("Failed to fetch jobs:", err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
}

export { getJobs };