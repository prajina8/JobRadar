import axios from "axios";


const ARBEITNOW_API =
  process.env.ARBEITNOW_JOBS_API_URL || "https://www.arbeitnow.com/api/job-board-api";

export async function fetchArbeitnowJobs() {
  try {
    console.log("Fetching jobs from Arbeitnow...");

    const response = await axios.get(ARBEITNOW_API, {
      timeout: 20000,
      headers: { Accept: "application/json", "User-Agent": "Job-Portal/1.0" },
    });

    const jobs = Array.isArray(response.data?.data) ? response.data.data : [];

    console.log(`Arbeitnow returned ${jobs.length} jobs`);

    return jobs.map(normalizeArbeitnowJob).filter(Boolean);
  } catch (error) {
    console.error("Arbeitnow API error:", error.response?.data || error.message);
    return [];
  }
}

function normalizeArbeitnowJob(job) {
  if (!job) return null;

  const externalId = job.slug || job.id;
  if (!externalId) return null;

  const skills = Array.isArray(job.tags) ? job.tags.filter((t) => typeof t === "string") : [];

  return {
    title: job.title || "Untitled Job",
    company: job.company_name || "Unknown Company",
    location: job.location || (job.remote ? "Remote" : "Not specified"),
    description: job.description || "",
    skills,
    jobType: Array.isArray(job.job_types) && job.job_types.length ? job.job_types[0] : "",
    workMode: job.remote ? "Remote" : "On-site",
    postedAt: job.created_at ? new Date(job.created_at * 1000) : new Date(),
    source: "Arbeitnow",
    sourceUrl: job.url || "",
    externalId: String(externalId),
    isExternal: true,
    isActive: true,
  };
}