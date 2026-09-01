import axios from "axios";

export async function fetchLinkedInJobs() {
  const apiUrl = process.env.LINKEDIN_JOBS_API_URL;
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;

  if (process.env.DEMO_EXTERNAL_JOBS === "true") {
    return getDemoLinkedInJobs();
  }

  if (!apiUrl || !accessToken) {
    console.warn("LinkedIn API is not configured.");
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

    const jobs =
      response.data?.jobs ||
      response.data?.elements ||
      [];

    return jobs.map(normalizeLinkedInJob).filter(Boolean);
  } catch (error) {
    console.error(
      "LinkedIn fetch failed:",
      error.response?.data || error.message
    );

    return [];
  }
}



function getDemoLinkedInJobs() {
  return [
    {
      title: "Junior React Developer",
      company: "Tech Solutions Nepal",
      description:
        "We are looking for a Junior React Developer to join our frontend development team.",
      requirements: [
        "Knowledge of React.js",
        "Knowledge of JavaScript",
        "Understanding of REST APIs",
      ],
      skills: ["React", "JavaScript", "HTML", "CSS", "REST API"],
      location: "Kathmandu",
      jobType: "Full-time",
      workMode: "Hybrid",
      experienceLevel: "Entry level",
      salary: "NPR 30,000 - 50,000",
      postedDate: new Date(),
      source: "LinkedIn",
      sourceUrl: "https://www.linkedin.com/jobs/",
      externalId: "linkedin-demo-001",
      isExternal: true,
      isActive: true,
    },

    {
      title: "MERN Stack Developer",
      company: "Digital Nepal Pvt. Ltd.",
      description:
        "Join our engineering team as a MERN Stack Developer and build scalable web applications.",
      requirements: [
        "React.js",
        "Node.js",
        "Express.js",
        "MongoDB",
      ],
      skills: [
        "React",
        "Node.js",
        "Express",
        "MongoDB",
        "JavaScript",
      ],
      location: "Kathmandu",
      jobType: "Full-time",
      workMode: "On-site",
      experienceLevel: "1-2 years",
      salary: "NPR 50,000 - 80,000",
      postedDate: new Date(),
      source: "LinkedIn",
      sourceUrl: "https://www.linkedin.com/jobs/",
      externalId: "linkedin-demo-002",
      isExternal: true,
      isActive: true,
    },

    {
      title: "Frontend Developer Intern",
      company: "CloudTech Nepal",
      description:
        "An internship opportunity for students interested in frontend web development.",
      requirements: [
        "Basic JavaScript knowledge",
        "Basic React knowledge",
        "HTML and CSS",
      ],
      skills: ["React", "JavaScript", "HTML", "CSS"],
      location: "Pokhara",
      jobType: "Internship",
      workMode: "Remote",
      experienceLevel: "Internship",
      salary: "NPR 10,000 - 15,000",
      postedDate: new Date(),
      source: "LinkedIn",
      sourceUrl: "https://www.linkedin.com/jobs/",
      externalId: "linkedin-demo-003",
      isExternal: true,
      isActive: true,
    },
  ];
}

/*
|--------------------------------------------------------------------------
| NORMALIZER FOR REAL AUTHORIZED LINKEDIN DATA
|--------------------------------------------------------------------------
*/

function normalizeLinkedInJob(job) {
  const externalId =
    job.id ||
    job.jobId ||
    job.externalId ||
    job.referenceNumber;

  if (!externalId) return null;

  return {
    title: job.title || job.name || "Untitled Job",

    company:
      job.company?.name ||
      job.companyName ||
      "Unknown Company",

    description:
      job.description ||
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
      "Remote",

    jobType: normalizeJobType(
      job.jobType || job.employmentType
    ),

    workMode: normalizeWorkMode(
      job.workMode ||
      job.workplaceType
    ),

    experienceLevel: normalizeExperience(
      job.experienceLevel ||
      job.seniorityLevel
    ),

    salary: job.salary || "",

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