import User from "../models/User.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";

export async function stats(_req, res) {
  const [users, applicants, recruiters, jobs, externalJobs, applications] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "applicant" }),
    User.countDocuments({ role: "recruiter" }),
    Job.countDocuments(),
    Job.countDocuments({ isExternal: true }),
    Application.countDocuments()
  ]);
  res.json({ users, applicants, recruiters, jobs, externalJobs, applications });
}
