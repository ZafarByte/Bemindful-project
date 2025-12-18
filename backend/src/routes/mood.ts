import express from "express";
import { auth } from "../middleware/auth";
import { createMood, getMoodHistory } from "../controllers/moodController";

const router = express.Router();

// All routes are protected with authentication
router.use(auth);

// Track a new mood entry
router.post("/", createMood);
// Fetch mood history
router.get("/", getMoodHistory);

export default router;