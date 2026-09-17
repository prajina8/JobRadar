import mongoose from "mongoose";

export const MAX_JOB_POSTS_PER_RECRUITER = 10;


const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  requirements: [{ type: String }],
  skills: [{ type: String }],
  location: { type: String, default: "Remote" },
  jobType: { type: String, enum: ["Full-time", "Part-time", "Internship", "Contract", "Freelance"], default: "Full-time" },
  workMode: { type: String, enum: ["Remote", "Hybrid", "On-site"], default: "On-site" },
  experienceLevel: { type: String, enum: ["Internship", "Entry level", "1-2 years", "2-5 years", "5+ years"], default: "Entry level" },
  salary: { type: String, default: "" },
  postedDate: { type: Date, default: Date.now },
  deadline: { type: Date },
  source: { type: String, default: "SmartJob" },
  sourceUrl: { type: String, default: "" },
  externalId: { type: String, default: "" },
  isExternal: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

jobSchema.index({isActive:1, deadline: 1});
jobSchema.pre("save", function (next) {
  const maxDeadline = new Date(
    (this.postedDate || Date.now()).valueOf() + MAX_JOB_LIFETIME_DAYS * 86400000
  );

  if (!this.deadline || this.deadline > maxDeadline) {
    this.deadline = maxDeadline;
  }

  if (this.deadline.getTime() <= Date.now()) {
    this.isActive = false;
  }

  next();
});

jobSchema.index({ title: "text", company: "text", description: "text", skills: "text", location: "text" });
jobSchema.index({ source: 1, externalId: 1 }, { unique: true, sparse: true });

export default mongoose.model("Job", jobSchema);
