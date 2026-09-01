import axios from "axios";


export async function fetchMeroJobJobs() {
  const apiUrl = process.env.MEROJOB_JOBS_API_URL;
  const apiToken = process.env.MEROJOB_API_TOKEN;

  if (!apiUrl) {
    console.warn(
      "MeroJob integration is not configured. Skipping MeroJob job sync."
    );

    return [];
  }

  try {
    const headers = {
      Accept: "application/json",
    };

    if (apiToken) {
      headers.Authorization = `Bearer ${apiToken}`;
    }

    const response = await axios.get(apiUrl, {
      headers,
      timeout: 15000,
    });

    const jobs =
      response.data?.jobs ||
      response.data?.results ||
      response.data?.data ||
      [];

    return jobs.map(normalizeMeroJob).filter(Boolean);
  } catch (error) {
    console.error(
      "MeroJob job fetch failed:",
      error.response?.data || error.message
    );

    return [];
  }
}

function normalizeMeroJob(job) {
  const externalId =
    job.id ||
    job.jobId ||
    job.externalId ||
    job.slug;

  if (!externalId) {
    return null;
  }

  return {
    title:
      job.title ||
      job.jobTitle ||
      "Untitled Job",

    company:
      job.company?.name ||
      job.companyName ||
      job.organization ||
      "Unknown Company",

    description:
      job.description ||
      job.jobDescription ||
      "",

    requirements: Array.isArray(job.requirements)
      ? job.requirements
      : [],

    skills: Array.isArray(job.skills)
      ? job.skills
      : [],

    location:
      job.location?.name ||
      job.location ||
      job.city ||
      "Nepal",

    jobType: normalizeJobType(
      job.jobType ||
        job.employmentType ||
        job.type
    ),

    workMode: normalizeWorkMode(
      job.workMode ||
        job.workplaceType ||
        job.workplace
    ),

    experienceLevel: normalizeExperience(
      job.experienceLevel ||
        job.experience ||
        job.seniority
    ),

    salary:
      job.salary ||
      job.salaryRange ||
      "",

    postedDate: parseDate(
      job.postedDate ||
        job.postedAt ||
        job.datePosted
    ),

    deadline: parseDate(
      job.deadline ||
        job.applicationDeadline ||
        job.expiryDate
    ),

    source: "MeroJob",

    sourceUrl:
      job.sourceUrl ||
      job.url ||
      job.jobUrl ||
      "",

    externalId: String(externalId),

    isExternal: true,

    isActive: true,
  };
}

function parseDate(value) {
  if (!value) {
    return new Date();
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? new Date()
    : date;
}

function normalizeJobType(type) {
  if (!type) return "Full-time";

  const value = String(type).toLowerCase();

  if (value.includes("part")) return "Part-time";
  if (value.includes("intern")) return "Internship";
  if (value.includes("contract")) return "Contract";
  if (value.includes("freelance")) return "Freelance";

  return "Full-time";
}

function normalizeWorkMode(mode) {
  if (!mode) return "On-site";

  const value = String(mode).toLowerCase();

  if (value.includes("remote")) return "Remote";
  if (value.includes("hybrid")) return "Hybrid";

  return "On-site";
}

function normalizeExperience(level) {
  if (!level) return "Entry level";

  const value = String(level).toLowerCase();

  if (
    value.includes("intern") ||
    value.includes("fresher")
  ) {
    return "Internship";
  }

  if (
    value.includes("entry") ||
    value.includes("junior") ||
    value.includes("fresher")
  ) {
    return "Entry level";
  }

  if (value.includes("1-2")) return "1-2 years";
  if (value.includes("2-5")) return "2-5 years";
  if (value.includes("5+")) return "5+ years";

  return "Entry level";
}