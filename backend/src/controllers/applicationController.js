import Application from "../models/Application.js";
import Job from "../models/Job.js";

export async function apply(req, res) {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job || !job.isActive) return res.status(404).json({ message: "Active job not found" });
    if (job.isExternal && job.sourceUrl) {
      return res.status(400).json({ message: "This is an external listing. Apply using the source link.", sourceUrl: job.sourceUrl });
    }
    const application = await Application.create({
      applicant: req.user._id,
      job: job._id,
      recruiter: job.recruiter,
      resumeUrl: req.user.resumeUrl || ""
    });
    res.status(201).json(await application.populate("job", "title company"));
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "You already applied to this job" });
    res.status(400).json({ message: err.message });
  }
}

export async function myApplications(req, res) {
  res.json(await Application.find({ applicant: req.user._id }).populate("job", "title company location").sort({ createdAt: -1 }));
}

export async function recruiterApplications(req, res) {
  res.json(await Application.find({ recruiter: req.user._id }).populate("applicant", "name email skills experienceYears resumeUrl").populate("job", "title company").sort({ createdAt: -1 }));
}

export async function updateStatus(req, res) {
  const allowed = ["Applied", "Viewed", "Shortlisted", "Interview", "Rejected", "Accepted"];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid status" });
  const application = await Application.findOneAndUpdate(
    { _id: req.params.id, recruiter: req.user._id },
    { status: req.body.status },
    { new: true }
  );
  if (!application) return res.status(404).json({ message: "Application not found" });
  res.json(application);
}
