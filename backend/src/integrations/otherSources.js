
import axios from "axios";



export async function fetchOtherSourceJobs() {
  
  if (process.env.DEMO_EXTERNAL_JOBS === "true") {
    return getDemoOtherJobs();
  }

  const apiUrl = process.env.OTHER_JOBS_API_URL;
  const accessToken = process.env.OTHER_JOBS_API_TOKEN;

  if (!apiUrl) {
    console.warn("Other jobs API is not configured.");
    return [];
  }

  try {
    const headers = {
      Accept: "application/json",
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await axios.get(apiUrl, {
      headers,
      timeout: 15000,
    });

    const jobs =
      response.data?.jobs ||
      response.data?.data ||
      response.data?.results ||
      response.data?.items ||
      [];

    if (!Array.isArray(jobs)) {
      console.warn("Other jobs API returned an invalid job list.");
      return [];
    }

    return jobs
      .map(normalizeOtherJob)
      .filter(Boolean);

  } catch (error) {
    console.error(
      "Other source job fetch failed:",
      error.response?.data || error.message
    );

    return [];
  }
}




function normalizeOtherJob(job) {
  const externalId =
    job.id ||
    job.jobId ||
    job.externalId ||
    job.referenceNumber;

  if (!externalId) {
    return null;
  }

  return {
    title:
      job.title ||
      job.name ||
      "Untitled Job",

    company:
      job.company?.name ||
      job.companyName ||
      job.organization ||
      job.employer ||
      "Unknown Company",

    description:
      job.description ||
      job.summary ||
      "",

    requirements:
      Array.isArray(job.requirements)
        ? job.requirements
        : [],

    skills:
      Array.isArray(job.skills)
        ? job.skills
        : [],

    location:
      job.location?.name ||
      job.location ||
      "Remote",

    jobType: normalizeJobType(
      job.jobType ||
      job.employmentType ||
      job.type
    ),

    workMode: normalizeWorkMode(
      job.workMode ||
      job.workplaceType ||
      job.remoteType
    ),

    experienceLevel: normalizeExperience(
      job.experienceLevel ||
      job.seniorityLevel ||
      job.experience
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

    
    source: job.source || "Other",

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
  if (!type) {
    return "Full-time";
  }

  const value = String(type).toLowerCase();

  if (value.includes("part")) {
    return "Part-time";
  }

  if (value.includes("intern")) {
    return "Internship";
  }

  if (value.includes("contract")) {
    return "Contract";
  }

  if (value.includes("freelance")) {
    return "Freelance";
  }

  return "Full-time";
}




function normalizeWorkMode(mode) {
  if (!mode) {
    return "On-site";
  }

  const value = String(mode).toLowerCase();

  if (
    value.includes("remote") ||
    value.includes("work from home")
  ) {
    return "Remote";
  }

  if (value.includes("hybrid")) {
    return "Hybrid";
  }

  return "On-site";
}




function normalizeExperience(level) {
  if (!level) {
    return "Entry level";
  }

  const value = String(level).toLowerCase();

  if (
    value.includes("intern") ||
    value.includes("student")
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

  if (value.includes("1-2")) {
    return "1-2 years";
  }

  if (value.includes("2-5")) {
    return "2-5 years";
  }

  if (
    value.includes("5+") ||
    value.includes("senior")
  ) {
    return "5+ years";
  }

  return "Entry level";
}




function getDemoOtherJobs() {
  return [
    {
      title: "Backend Developer",
      company: "Nepal Software Company",
      description:
        "We are looking for a backend developer to build and maintain scalable web applications.",

      requirements: [
        "Node.js",
        "Express.js",
        "MongoDB",
        "REST API",
      ],

      skills: [
        "Node.js",
        "Express",
        "MongoDB",
        "JavaScript",
        "REST API",
      ],

      location: "Kathmandu",

      jobType: "Full-time",

      workMode: "Hybrid",

      experienceLevel: "1-2 years",

      salary: "NPR 40,000 - 70,000",

      postedDate: new Date(),

      source: "Other",

      sourceUrl: "",

      externalId: "other-demo-001",

      isExternal: true,

      isActive: true,
    },

    {
      title: "Web Developer Intern",
      company: "Digital Innovation Nepal",
      description:
        "Internship opportunity for students interested in modern web development.",

      requirements: [
        "HTML",
        "CSS",
        "JavaScript",
        "React",
      ],

      skills: [
        "HTML",
        "CSS",
        "JavaScript",
        "React",
      ],

      location: "Pokhara",

      jobType: "Internship",

      workMode: "Remote",

      experienceLevel: "Internship",

      salary: "NPR 8,000 - 15,000",

      postedDate: new Date(),

      source: "Other",

      sourceUrl: "",

      externalId: "other-demo-002",

      isExternal: true,

      isActive: true,
    },
  ];
}

