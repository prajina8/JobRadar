import axios from "axios";

export async function fetchOtherSourceJobs() {
  const apiUrl =
    process.env.OTHER_JOBS_API_URL;

  const accessToken =
    process.env.OTHER_JOBS_API_TOKEN;

  if (!apiUrl) {
    console.warn(
      "Other authorized job feed is not configured."
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
      response.data?.data ||
      response.data?.results ||
      [];

    return jobs
      .map(normalizeOtherJob)
      .filter(Boolean);
  } catch (error) {
    console.error(
      "Other authorized feed failed:",
      error.response?.data ||
        error.message
    );

    return [];
  }
}

function normalizeOtherJob(job) {
  if (!job) return null;

  const externalId =
    job.id ||
    job.jobId ||
    job.externalId;

  if (!externalId) return null;

  return {
    title:
      job.title ||
      "Untitled Job",

    company:
      job.company ||
      job.companyName ||
      "Unknown Company",

    location:
      job.location ||
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

    source:
      job.source ||
      "External Feed",

    sourceUrl:
      job.url ||
      job.applyUrl ||
      "",

    externalId: String(externalId),

    isExternal: true,

    isActive: true,
  };
}