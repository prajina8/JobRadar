import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import { stats } from "../controllers/adminController.js";
const router = Router();
router.get("/stats", protect, authorize("admin"), stats);
export default router;
