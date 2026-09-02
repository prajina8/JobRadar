import axios from "axios";

export async function fetchLinkedInJobs() {
  const apiUrl = process.env.LINKEDIN_JOBS_API_URL;
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;

  if (!apiUrl) {
    console.warn(
      "LinkedIn authorized feed is not configured."
    );

    return [];
  }

  try {
    const response = await axios.get(apiUrl, {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          }
        : {
            Accept: "application/json",
          },

      timeout: 15000,
    });

    const jobs =
      response.data?.jobs ||
      response.data?.elements ||
      response.data?.data ||
      [];

    return jobs
      .map(normalizeLinkedInJob)
      .filter(Boolean);
  } catch (error) {
    console.error(
      "LinkedIn authorized feed failed:",
      error.response?.data ||
        error.message
    );

    return [];
  }
}

function normalizeLinkedInJob(job) {
  if (!job) return null;

  const externalId =
    job.id ||
    job.jobId ||
    job.externalId;

  if (!externalId) return null;

  return {
    title:
      job.title ||
      job.name ||
      "Untitled Job",

    company:
      job.company?.name ||
      job.companyName ||
      "Unknown Company",

    location:
      job.location ||
      job.formattedLocation ||
      "Not specified",

    description:
      job.description ||
      "",

    skills:
      Array.isArray(job.skills)
        ? job.skills
        : [],

    jobType:
      job.jobType ||
      job.employmentType ||
      "",

    postedAt:
      job.postedAt
        ? new Date(job.postedAt)
        : new Date(),

    source: "LinkedIn",

    sourceUrl:
      job.url ||
      job.applyUrl ||
      "",

    externalId: String(externalId),

    isExternal: true,

    isActive: true,
  };
}