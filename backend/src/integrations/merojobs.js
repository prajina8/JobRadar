import axios from "axios";

export async function fetchMeroJobJobs() {
  const apiUrl = process.env.MEROJOB_JOBS_API_URL;
  const accessToken =
    process.env.MEROJOB_ACCESS_TOKEN;

  if (!apiUrl) {
    console.warn(
      "MeroJob authorized feed is not configured."
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
      .map(normalizeMeroJob)
      .filter(Boolean);
  } catch (error) {
    console.error(
      "MeroJob authorized feed failed:",
      error.response?.data ||
        error.message
    );

    return [];
  }
}

function normalizeMeroJob(job) {
  if (!job) return null;

  const externalId =
    job.id ||
    job.jobId ||
    job.externalId;

  if (!externalId) return null;

  return {
    title:
      job.title ||
      job.jobTitle ||
      "Untitled Job",

    company:
      job.company ||
      job.companyName ||
      job.organization ||
      "Unknown Company",

    location:
      job.location ||
      job.city ||
      "Not specified",

    description:
      job.description ||
      job.jobDescription ||
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

    source: "MeroJob",

    sourceUrl:
      job.url ||
      job.applyUrl ||
      "",

    externalId: String(externalId),

    isExternal: true,

    isActive: true,
  };
}