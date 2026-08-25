import Job from "../models/Job.js";
import SavedJob from "../models/SavedJob.js";

export async function listJobs(req, res) {
  try {
    const { q, location, jobType, workMode, experienceLevel, posted, page = 1, limit = 12 } = req.query;
    const filter = { isActive: true };
    if (q) filter.$text = { $search: q };
    if (location) filter.location = new RegExp(location, "i");
    if (jobType) filter.jobType = jobType;
    if (workMode) filter.workMode = workMode;
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (posted) {
      const days = Number(posted);
      if (Number.isFinite(days)) filter.postedDate = { $gte: new Date(Date.now() - days * 86400000) };
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [jobs, total] = await Promise.all([
      Job.find(filter).sort({ postedDate: -1 }).skip(skip).limit(Number(limit)),
      Job.countDocuments(filter)
    ]);
    res.json({ jobs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getJob(req, res) {
  const job = await Job.findById(req.params.id).populate("recruiter", "name email");
  if (!job) return res.status(404).json({ message: "Job not found" });
  res.json(job);
}

export async function createJob(req, res) {
  try {
    const job = await Job.create({ ...req.body, recruiter: req.user._id, source: "SmartJob", isExternal: false });
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function myJobs(req, res) {
  res.json(await Job.find({ recruiter: req.user._id }).sort({ createdAt: -1 }));
}

export async function deleteJob(req, res) {
  const job = await Job.findOne({ _id: req.params.id, recruiter: req.user._id });
  if (!job) return res.status(404).json({ message: "Job not found" });
  job.isActive = false;
  await job.save();
  res.json({ message: "Job closed" });
}

export async function toggleSave(req, res) {
  const existing = await SavedJob.findOne({ user: req.user._id, job: req.params.id });
  if (existing) {
    await existing.deleteOne();
    return res.json({ saved: false });
  }
  await SavedJob.create({ user: req.user._id, job: req.params.id });
  res.json({ saved: true });
}

export async function savedJobs(req, res) {
  const rows = await SavedJob.find({ user: req.user._id }).populate("job").sort({ createdAt: -1 });
  res.json(rows.map(r => r.job).filter(Boolean));
}

export async function recommendations(req, res) {
  const jobs = await Job.find({ isActive: true }).sort({ postedDate: -1 }).limit(200).lean();
  const user = req.user;
  const userSkills = new Set((user.skills || []).map(s => s.toLowerCase()));
  const interests = (user.interests || []).map(s => s.toLowerCase());
  const roles = (user.preferences?.desiredRoles || []).map(s => s.toLowerCase());
  const locations = (user.preferences?.locations || []).map(s => s.toLowerCase());

  const ranked = jobs.map(job => {
    const skills = (job.skills || []).map(s => s.toLowerCase());
    const skillHits = skills.filter(s => userSkills.has(s)).length;
    const skillScore = skills.length ? skillHits / skills.length : 0;
    const title = job.title.toLowerCase();
    const titleMatch = [...interests, ...roles].some(x => x && title.includes(x)) ? 1 : 0;
    const locationMatch = locations.some(x => x && job.location.toLowerCase().includes(x)) || job.workMode === "Remote" ? 1 : 0;
    const typeMatch = (user.preferences?.jobTypes || []).includes(job.jobType) ? 1 : 0;
    const experienceMatch = experienceMatches(user.experienceYears, job.experienceLevel) ? 1 : 0;
    const score = Math.round((skillScore * 40 + titleMatch * 20 + locationMatch * 15 + experienceMatch * 15 + typeMatch * 10));
    return { ...job, matchScore: score };
  }).sort((a, b) => b.matchScore - a.matchScore);

  res.json(ranked.slice(0, 20));
}

function experienceMatches(years, level) {
  if (level === "Internship") return years <= 1;
  if (level === "Entry level") return years <= 1;
  if (level === "1-2 years") return years >= 1 && years <= 3;
  if (level === "2-5 years") return years >= 2;
  if (level === "5+ years") return years >= 5;
  return true;
}
