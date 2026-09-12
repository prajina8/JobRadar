import axios from "axios";

const REMOTEOK_API =
  process.env.REMOTEOK_JOBS_API_URL ||
  "https://remoteok.com/api";


export async function fetchRemoteOKJobs() {
  try {
    console.log("Fetching jobs from Remote OK...");

    const response = await axios.get(REMOTEOK_API, {
      timeout: 20000,

      headers: {
        Accept: "application/json",
        "User-Agent": "Job-Portal/1.0",
      },
    });

    const data = response.data;

    if (!Array.isArray(data)) {
      console.warn(
        "Remote OK returned unexpected data format."
      );

      return [];
    }

  
    const jobs = data.filter((job) => {
      return (
        job &&
        typeof job === "object" &&
        (job.id || job.slug || job.position)
      );
    });

    console.log(
      `Remote OK returned ${jobs.length} jobs`
    );

    return jobs
      .map(normalizeRemoteOKJob)
      .filter(Boolean);
  } catch (error) {
    console.error(
      "Remote OK API error:",
      error.response?.data || error.message
    );

    return [];
  }
}

function normalizeRemoteOKJob(job) {
  if (!job) return null;

  const externalId =
    job.id ||
    job.slug ||
    job.url;

  if (!externalId) {
    return null;
  }

  const postedAt = parseDate(
    job.date ||
      job.posted_at ||
      job.postedAt
  );

  const skills = extractSkills(job);

  const location =
    job.location ||
    "Remote";

  const company =
    job.company ||
    job.company_name ||
    "Unknown Company";

  const title =
    job.position ||
    job.title ||
    "Untitled Job";

  return {
    title,

    company,

    location,

    description:
      job.description ||
      "",

    skills,

    jobType:
      job.job_type ||
      job.employmentType ||
      "",

    postedAt:
      postedAt || new Date(),

    source: "Remote OK",

    sourceUrl:
      job.url ||
      `https://remoteok.com/remote-jobs/${job.slug || ""}`,

    externalId: String(externalId),

    isExternal: true,

    isActive: true,
  };
}

function extractSkills(job) {
  const skills = [];

 
  if (Array.isArray(job.tags)) {
    skills.push(
      ...job.tags.filter(
        (tag) => typeof tag === "string"
      )
    );
  }

 
  if (Array.isArray(job.skills)) {
    skills.push(
      ...job.skills
        .map((skill) =>
          typeof skill === "string"
            ? skill
            : skill?.name
        )
        .filter(Boolean)
    );
  }

  return [...new Set(skills)];
}

function parseDate(value) {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}
