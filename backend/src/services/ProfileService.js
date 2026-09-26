import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { AVATAR_UPLOAD_DIR, RESUME_UPLOAD_DIR } from "../middleware/upload.js";

const EDITABLE_PROFILE_FIELDS = [
  "name", "bio", "phone", "location", "skills", "interests",
  "experienceYears", "education", "resumeUrl", "preferences", "avatar"
];

export async function fetchProfile(userId) {
  return User.findById(userId).select("-password");
}

export async function updateProfileFields(userId, payload) {
  const update = {};
  for (const key of EDITABLE_PROFILE_FIELDS) {
    if (payload[key] !== undefined) update[key] = payload[key];
  }
  return User.findByIdAndUpdate(userId, update, { new: true, runValidators: true }).select("-password");
}

export async function saveAvatar(userId, file, previousAvatar) {
  const avatarUrl = `/uploads/avatars/${file.filename}`;

  const user = await User.findByIdAndUpdate(
    userId,
    { avatar: avatarUrl },
    { new: true, runValidators: true }
  ).select("-password");

  if (previousAvatar && previousAvatar.startsWith("/uploads/avatars/")) {
    const oldPath = path.join(AVATAR_UPLOAD_DIR, path.basename(previousAvatar));
    fs.unlink(oldPath, () => {});
  }

  return user;
}

export async function saveResume(userId, file, previousResume) {
  const resumeUrl = `/uploads/resumes/${file.filename}`;

  const user = await User.findByIdAndUpdate(
    userId,
    { resumeUrl },
    { new: true, runValidators: true }
  ).select("-password");

  if (previousResume && previousResume.startsWith("/uploads/resumes/")) {
    const oldPath = path.join(RESUME_UPLOAD_DIR, path.basename(previousResume));
    fs.unlink(oldPath, () => {});
  }

  return user;
}

export async function removeResumeFile(userId, previousResume) {
  const user = await User.findByIdAndUpdate(
    userId,
    { resumeUrl: "" },
    { new: true, runValidators: true }
  ).select("-password");

  if (previousResume && previousResume.startsWith("/uploads/resumes/")) {
    const oldPath = path.join(RESUME_UPLOAD_DIR, path.basename(previousResume));
    fs.unlink(oldPath, () => {});
  }

  return user;
}

export async function changeUserPassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  const matches = await bcrypt.compare(currentPassword || "", user.password);
  if (!matches) {
    const err = new Error("Current password is incorrect");
    err.status = 400;
    throw err;
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();
}

export async function updatePrivacySettings(userId, privacy) {
  const set = {};
  if (privacy.profileVisibility !== undefined) set["privacy.profileVisibility"] = privacy.profileVisibility;
  if (privacy.showEmail !== undefined) set["privacy.showEmail"] = privacy.showEmail;
  if (privacy.showPhone !== undefined) set["privacy.showPhone"] = privacy.showPhone;

  return User.findByIdAndUpdate(userId, { $set: set }, { new: true, runValidators: true }).select("-password");
}