import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  resumeUrl: { type: String, default: "" },
  status: {
    type: String,
    enum: ["Applied", "Viewed", "Shortlisted", "Interview", "Rejected", "Accepted"],
    default: "Applied"
  }
}, { timestamps: true });

applicationSchema.index({ applicant: 1, job: 1 }, { unique: true });

export default mongoose.model("Application", applicationSchema);
