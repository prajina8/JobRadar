import User from "../models/User.js";

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
  res.json(user);
}
