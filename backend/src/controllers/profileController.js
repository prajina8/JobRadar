import fs from "fs";
import path from "path";
import User from "../models/User.js";
import { AVATAR_UPLOAD_DIR } from "../middleware/upload.js";

export async function getProfile(req, res) {
  res.json(req.user);
}


export async function updateProfile(req, res) {
  const allowed = [
    "name", "bio", "phone", "location", "skills", "interests",
    "experienceYears", "education", "resumeUrl", "preferences", "avatar"
  ];
  const update = {};
  for (const key of allowed) if (req.body[key] !== undefined) update[key] = req.body[key];

  const user = await User.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true }).select("-password");
  res.json(user);}


  
  export async function uploadProfileAvatar(req, res) {
  if (!req.file) return res.status(400).json({ message: "No image file was uploaded" });

  const previousAvatar = req.user.avatar;
  const avatarUrl = `/uploads/avatars/${req.file.filename}`;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: avatarUrl },
    { new: true, runValidators: true }
  ).select("-password");


  if (previousAvatar && previousAvatar.startsWith("/uploads/avatars/")) {
    const oldPath = path.join(AVATAR_UPLOAD_DIR, path.basename(previousAvatar));
    fs.unlink(oldPath, () => {});
  }

  res.json(user);
}  

