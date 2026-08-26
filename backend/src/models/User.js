import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ["applicant", "recruiter", "admin"], default: "applicant" },
  isVerified: { type: Boolean, default: false },
  avatar: { type: String, default: "" },
  bio: { type: String, default: "" },
  phone: { type: String, default: "" },
  location: { type: String, default: "" },
  skills: [{ type: String, trim: true }],
  interests: [{ type: String, trim: true }],
  experienceYears: { type: Number, default: 0, min: 0 },
  education: { type: String, default: "" },
  resumeUrl: { type: String, default: "" },
  preferences: {
    locations: [{ type: String }],
    jobTypes: [{ type: String }],
    workModes: [{ type: String }],
    desiredRoles: [{ type: String }]
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
