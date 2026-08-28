import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import { apply, myApplications, recruiterApplications, updateStatus } from "../controllers/applicationController.js";

const router = Router();
router.get("/mine", protect, authorize("applicant"), myApplications);
router.get("/recruiter", protect, authorize("recruiter"), recruiterApplications);
router.post("/:jobId", protect, authorize("applicant"), apply);
router.patch("/:id/status", protect, authorize("recruiter"), updateStatus);
export default router;
