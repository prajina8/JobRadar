import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import { syncJobs } from "../controllers/jobSyncController.js";
import {
  listJobs, getJob, createJob, myJobs, deleteJob,
  toggleSave, savedJobs, recommendations
} from "../controllers/jobController.js";

const router = Router();

router.get("/", listJobs);
router.get("/saved", protect, authorize("applicant"), savedJobs);
router.get("/recommendations", protect, authorize("applicant"), recommendations);
router.post("/sync", protect, authorize("recruiter"), syncJobs);
router.get("/mine", protect, authorize("recruiter"), myJobs);
router.get("/:id", getJob);
router.post("/", protect, authorize("recruiter"), createJob);
router.patch("/:id/close", protect, authorize("recruiter"), deleteJob);
router.post("/:id/save", protect, authorize("applicant"), toggleSave);

export default router;
