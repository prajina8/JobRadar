import axios from "axios";

// Free tier: 250 calls/day, no credit card. Get keys at https://developer.adzuna.com/
const APP_ID = process.env.ADZUNA_APP_ID;
const APP_KEY = process.env.ADZUNA_APP_KEY;
const COUNTRY = process.env.ADZUNA_COUNTRY || "in"; // e.g. "in", "gb", "us" — Nepal isn't listed, "in" is the closest regional match
const QUERIES = (process.env.ADZUNA_QUERIES || "developer,software engineer,intern")
  .split(",")
  .map((q) => q.trim())
  .filter(Boolean);

export async function fetchAdzunaJobs() {
  if (!APP_ID || !APP_KEY) {
    console.warn("Adzuna is not configured (missing ADZUNA_APP_ID / ADZUNA_APP_KEY).");
    return [];
  }

  try {
    console.log("Fetching jobs from Adzuna...");

    const pages = await Promise.allSettled(QUERIES.map((q) => fetchPage(q)));

    const jobs = pages
      .filter((p) => p.status === "fulfilled")
      .flatMap((p) => p.value);

    console.log(`Adzuna returned ${jobs.length} jobs`);

    return jobs.map(normalizeAdzunaJob).filter(Boolean);
  } catch (error) {
    console.error("Adzuna API error:", error.response?.data || error.message);
    return [];
  }
}

async function fetchPage(query, page = 1) {
  const url = `https://api.adzuna.com/v1/api/jobs/${COUNTRY}/search/${page}`;

  const response = await axios.get(url, {
    timeout: 20000,
    params: {
      app_id: APP_ID,
      app_key: APP_KEY,
      what: query,
      results_per_page: 20,
    },
  });

  return response.data?.results || [];
}

function normalizeAdzunaJob(job) {
  if (!job) return null;

  const externalId = job.id;
  if (!externalId) return null;

  return {
    title: job.title || "Untitled Job",
    company: job.company?.display_name || "Unknown Company",
    location: job.location?.display_name || "Not specified",
    description: job.description || "",
    skills: [],
    jobType: job.contract_time || job.contract_type || "",
    salary:
      job.salary_min || job.salary_max
        ? `${job.salary_min ? Math.round(job.salary_min) : "?"} - ${
            job.salary_max ? Math.round(job.salary_max) : "?"
          }`
        : "",
    postedAt: job.created ? new Date(job.created) : new Date(),
    source: "Adzuna",
    sourceUrl: job.redirect_url || "",
    externalId: String(externalId),
    isExternal: true,
    isActive: true,
  };
}