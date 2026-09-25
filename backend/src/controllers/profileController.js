import {
  fetchProfile,
  updateProfileFields,
  saveAvatar,
  changeUserPassword,
  updatePrivacySettings,
} from "../services/ProfileService.js";

export async function getProfile(req, res) {
  try {
    const user = await fetchProfile(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const user = await updateProfileFields(req.user._id, req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function uploadProfileAvatar(req, res) {
  if (!req.file) {
    return res.status(400).json({
      message: "No image file was uploaded",
    });
  }

  try {
    const user = await saveAvatar(
      req.user._id,
      req.file,
      req.user.avatar
    );

    res.json(user);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    await changeUserPassword(
      req.user._id,
      currentPassword,
      newPassword
    );

    res.json({
      message: "Password updated successfully",
    });
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message,
    });
  }
}

export async function updatePrivacy(req, res) {
  try {
    const user = await updatePrivacySettings(
      req.user._id,
      req.body
    );

    res.json(user);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
}