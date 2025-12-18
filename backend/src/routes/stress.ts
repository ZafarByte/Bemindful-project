import express from "express";
import { auth } from "../middleware/auth";
import {
  getSummary,
  submitBaseline,
  submitDaily,
  getDailyCheckinHistory,
} from "../controllers/stressController";

const router = express.Router();

router.use(auth);

router.post("/baseline", submitBaseline);
router.post("/daily", submitDaily);
router.get("/summary", getSummary);
router.get("/history", getDailyCheckinHistory);

export default router;

