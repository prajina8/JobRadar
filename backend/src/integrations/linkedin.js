import axios from "axios";


export async function fetchLinkedInJobs() {
  const apiUrl = process.env.LINKEDIN_JOBS_API_URL;
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;

  if (!apiUrl || !accessToken) {
    console.warn(
      "LinkedIn integration is not configured. Skipping LinkedIn job sync."
    );
    return [];
  }

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      timeout: 15000,
    });

    const jobs = response.data?.jobs || response.data?.elements || [];

    return jobs.map(normalizeLinkedInJob).filter(Boolean);
  } catch (error) {
    console.error(
      "LinkedIn job fetch failed:",
      error.response?.data || error.message
    );

    return [];
  }
}

function normalizeLinkedInJob(job) {
  const externalId =
    job.id ||
    job.jobId ||
    job.externalId ||
    job.referenceNumber;

  if (!externalId) {
    return null;
  }

  return {
    title: job.title || job.name || "Untitled Job",

    company:
      job.company?.name ||
      job.companyName ||
      job.organization?.name ||
      "Unknown Company",

    description:
      job.description ||
      job.descriptionHtml ||
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
      job.formattedLocation ||
      "Remote",

    jobType: normalizeJobType(
      job.jobType || job.employmentType
    ),

    workMode: normalizeWorkMode(
      job.workMode ||
        job.workplaceType ||
        job.workplace
    ),

    experienceLevel: normalizeExperience(
      job.experienceLevel ||
        job.seniorityLevel
    ),

    salary:
      job.salary ||
      job.salaryRange ||
      "",

    postedDate: job.postedDate
      ? new Date(job.postedDate)
      : new Date(),

    deadline: job.deadline
      ? new Date(job.deadline)
      : undefined,

    source: "LinkedIn",

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
    value.includes("student")
  ) {
    return "Internship";
  }

  if (
    value.includes("entry") ||
    value.includes("junior")
  ) {
    return "Entry level";
  }

  if (value.includes("1-2")) return "1-2 years";
  if (value.includes("2-5")) return "2-5 years";
  if (value.includes("5+")) return "5+ years";

  return "Entry level";
}