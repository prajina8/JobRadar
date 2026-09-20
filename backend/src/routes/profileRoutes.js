import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { getProfile, updateProfile, uploadProfileAvatar } from "../controllers/profileController.js";
import { uploadAvatar } from "../middleware/upload.js";
const router = Router();
router.get("/", protect, getProfile);
router.put("/", protect, updateProfile);
router.post("/avatar", protect, (req, res, next) => {
  uploadAvatar(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, uploadProfileAvatar);
export default router;