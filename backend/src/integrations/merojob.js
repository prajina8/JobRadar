import axios from "axios";

export async function fetchMeroJobJobs() {
  const apiUrl = process.env.MEROJOB_JOBS_API_URL;
  const apiToken = process.env.MEROJOB_API_TOKEN;


  if (process.env.DEMO_EXTERNAL_JOBS === "true") {
    return getDemoMeroJobJobs();
  }

  if (!apiUrl) {
    console.warn("MeroJob API/feed is not configured.");
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
      "MeroJob fetch failed:",
      error.response?.data || error.message
    );

    return [];
  }
}



function getDemoMeroJobJobs() {
  return [
    {
      title: "React Developer",
      company: "WebTech Nepal",
      description:
        "WebTech Nepal is looking for a React Developer to build modern web applications.",
      requirements: [
        "Strong React knowledge",
        "JavaScript",
        "Git",
        "REST API",
      ],
      skills: [
        "React",
        "JavaScript",
        "HTML",
        "CSS",
        "Git",
      ],
      location: "Kathmandu",
      jobType: "Full-time",
      workMode: "On-site",
      experienceLevel: "Entry level",
      salary: "NPR 35,000 - 60,000",
      postedDate: new Date(),
      source: "MeroJob",
      sourceUrl: "https://merojob.com/",
      externalId: "merojob-demo-001",
      isExternal: true,
      isActive: true,
    },

    {
      title: "Node.js Developer",
      company: "Innovative IT Solutions",
      description:
        "We are looking for a Node.js developer to work on backend APIs and web applications.",
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
      ],
      location: "Lalitpur",
      jobType: "Full-time",
      workMode: "Hybrid",
      experienceLevel: "1-2 years",
      salary: "NPR 45,000 - 70,000",
      postedDate: new Date(),
      source: "MeroJob",
      sourceUrl: "https://merojob.com/",
      externalId: "merojob-demo-002",
      isExternal: true,
      isActive: true,
    },

    {
      title: "MERN Stack Intern",
      company: "Startup Nepal",
      description:
        "Internship opportunity for students who want to learn full-stack JavaScript development.",
      requirements: [
        "Basic React knowledge",
        "Basic Node.js knowledge",
        "MongoDB basics",
      ],
      skills: [
        "React",
        "Node.js",
        "MongoDB",
        "JavaScript",
      ],
      location: "Biratnagar",
      jobType: "Internship",
      workMode: "Remote",
      experienceLevel: "Internship",
      salary: "NPR 8,000 - 15,000",
      postedDate: new Date(),
      source: "MeroJob",
      sourceUrl: "https://merojob.com/",
      externalId: "merojob-demo-003",
      isExternal: true,
      isActive: true,
    },

    {
      title: "Python Developer",
      company: "Nepal Software House",
      description:
        "Develop backend applications and APIs using Python and modern frameworks.",
      requirements: [
        "Python",
        "Django",
        "REST API",
        "PostgreSQL",
      ],
      skills: [
        "Python",
        "Django",
        "REST API",
        "PostgreSQL",
      ],
      location: "Kathmandu",
      jobType: "Full-time",
      workMode: "Hybrid",
      experienceLevel: "2-5 years",
      salary: "NPR 60,000 - 100,000",
      postedDate: new Date(),
      source: "MeroJob",
      sourceUrl: "https://merojob.com/",
      externalId: "merojob-demo-004",
      isExternal: true,
      isActive: true,
    },
  ];
}



function normalizeMeroJob(job) {
  const externalId =
    job.id ||
    job.jobId ||
    job.externalId ||
    job.slug;

  if (!externalId) return null;

  return {
    title:
      job.title ||
      job.jobTitle ||
      "Untitled Job",

    company:
      job.company?.name ||
      job.companyName ||
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
      job.workplaceType
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
  if (!value) return new Date();

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
    value.includes("junior")
  ) {
    return "Entry level";
  }

  if (value.includes("1-2")) return "1-2 years";
  if (value.includes("2-5")) return "2-5 years";
  if (value.includes("5+")) return "5+ years";

  return "Entry level";
}