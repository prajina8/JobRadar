import axios from "axios";

const HIMALAYAS_API =
  process.env.HIMALAYAS_JOBS_API_URL || "https://himalayas.app/jobs/api";


export async function fetchHimalayasJobs() {
  try {
    console.log("Fetching jobs from Himalayas...");

    let cursor = null;
    const allJobs = [];
    const maxPages = 5;

    for (let page = 1; page <= maxPages; page++) {
      const params = {
        limit: 20,
      };

      if (cursor) {
        params.cursor = cursor;
      }

      const response = await axios.get(HIMALAYAS_API, {
        params,
        timeout: 20000,
        headers: {
          Accept: "application/json",
          "User-Agent": "Job-Portal/1.0",
        },
      });

      const data = response.data;

      const jobs = Array.isArray(data)
        ? data
        : data?.jobs || data?.data || [];

      allJobs.push(...jobs);

      console.log(
        `Himalayas page ${page}: received ${jobs.length} jobs`
      );

      cursor =
        data?.nextCursor ||
        data?.next_cursor ||
        null;

      if (!cursor || jobs.length === 0) {
        break;
      }
    }

    console.log(`Himalayas total jobs: ${allJobs.length}`);

    return allJobs
      .map(normalizeHimalayasJob)
      .filter(Boolean);
  } catch (error) {
    console.error(
      "Himalayas API error:",
      error.response?.data || error.message
    );

    return [];
  }
}

/**
 * Convert Himalayas job format into our Job model format.
 */
function normalizeHimalayasJob(job) {
  if (!job) return null;

  const externalId =
    job.guid ||
    job.id ||
    job.jobId ||
    job.slug;

  if (!externalId) {
    return null;
  }

  const postedAt = parseDate(
    job.pubDate ||
      job.publishedAt ||
      job.postedAt
  );

  const expiryDate = parseDate(
    job.expiryDate ||
      job.expiresAt
  );

  const isExpired =
    expiryDate && expiryDate.getTime() < Date.now();

  const skills = extractSkills(job);

  const location = extractLocation(job);

  return {
    title:
      job.title ||
      job.name ||
      "Untitled Job",

    company:
      job.companyName ||
      job.company?.name ||
      job.company ||
      "Unknown Company",

    location,

    description:
      job.description ||
      job.descriptionHtml ||
      "",

    skills,

    jobType:
      job.employmentType ||
      job.jobType ||
      "",

    postedAt:
      postedAt || new Date(),

    source: "Himalayas",

    sourceUrl:
      job.applicationLink ||
      job.url ||
      job.link ||
      "",

    externalId: String(externalId),

    isExternal: true,

    isActive: !isExpired,
  };
}

function extractSkills(job) {
  if (Array.isArray(job.skills)) {
    return job.skills
      .map((skill) =>
        typeof skill === "string"
          ? skill
          : skill?.name
      )
      .filter(Boolean);
  }

  if (Array.isArray(job.categories)) {
    return job.categories
      .map((category) =>
        typeof category === "string"
          ? category
          : category?.name
      )
      .filter(Boolean);
  }

  return [];
}

function extractLocation(job) {
  if (Array.isArray(job.locationRestrictions)) {
    return job.locationRestrictions.join(", ");
  }

  if (Array.isArray(job.locations)) {
    return job.locations.join(", ");
  }

  return (
    job.location ||
    job.formattedLocation ||
    "Remote"
  );
}

function parseDate(value) {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}