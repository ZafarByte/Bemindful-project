import { Request, Response, NextFunction } from "express";
import { BaselineSurvey } from "../models/BaselineSurvey";
import { DailyCheckin } from "../models/DailyCheckin";
import { logger } from "../utils/logger";

const BASELINE_REVERSE = new Set([
  "sleep",
  "focus",
  "social",
  "exercise",
  "meals",
  "recover",
  "optimistic",
]);

const DAILY_REVERSE = new Set(["energy", "sleep", "social", "mood"]);

const normalize = (value: number) => value / 4;
const flip = (value: number) => 1 - normalize(value);

const average = (values: number[]) =>
  values.reduce((acc, v) => acc + v, 0) / values.length;

const labelScore = (value: number) => {
  if (value < 0.3) return "High stress / Low mood";
  if (value < 0.5) return "Moderate stress";
  if (value < 0.7) return "Mild stress / Neutral mood";
  return "Low stress / Good mood";
};

const scoreBaseline = (answers: Record<string, number>) => {
  const values = Object.entries(answers).map(([key, v]) =>
    BASELINE_REVERSE.has(key) ? flip(v) : normalize(v)
  );
  return average(values);
};

const scoreDaily = (answers: Record<string, number>) => {
  const values = Object.entries(answers).map(([key, v]) => {
    if (key === "stress" || key === "anxiety") {
      return flip(v);
    }
    return DAILY_REVERSE.has(key) ? flip(v) : normalize(v);
  });
  return average(values);
};

export const submitBaseline = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;
    const { answers } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({ message: "Answers are required" });
    }

    const baselineScore = scoreBaseline(answers);

    const record = await BaselineSurvey.findOneAndUpdate(
      { userId },
      {
        userId,
        answers,
        score: baselineScore,
        completedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    logger.info("Baseline stored", { userId, baselineScore });

    res.status(201).json({ success: true, baselineScore: record.score });
  } catch (error) {
    next(error);
  }
};

export const submitDaily = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;
    const { answers } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const baseline = await BaselineSurvey.findOne({ userId });
    if (!baseline) {
      return res
        .status(400)
        .json({ message: "Baseline not found. Please complete baseline first." });
    }

    if (!answers || typeof answers !== "object") {
      return res.status(400).json({ message: "Answers are required" });
    }

    const dailyScore = scoreDaily(answers);
    const combinedScore = 0.7 * dailyScore + 0.3 * baseline.score;
    const label = labelScore(combinedScore);

    const entry = await DailyCheckin.create({
      userId,
      answers,
      dailyScore,
      combinedScore,
      label,
    });

    logger.info("Daily check-in stored", { userId, combinedScore, label });

    res.status(201).json({
      success: true,
      dailyScore: entry.dailyScore,
      combinedScore: entry.combinedScore,
      label: entry.label,
      baselineScore: baseline.score,
    });
  } catch (error) {
    next(error);
  }
};

export const getSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const baseline = await BaselineSurvey.findOne({ userId });
    const latestDaily = await DailyCheckin.findOne({ userId }).sort({
      createdAt: -1,
    });

    res.json({
      hasBaseline: !!baseline,
      baselineScore: baseline?.score ?? null,
      baselineCompletedAt: baseline?.completedAt ?? null,
      latestDaily: latestDaily
        ? {
            dailyScore: latestDaily.dailyScore,
            combinedScore: latestDaily.combinedScore,
            label: latestDaily.label,
            createdAt: latestDaily.createdAt,
          }
        : null,
    });
  } catch (error) {
    next(error);
  }
};

// Get daily check-in history (mood scores from stress surveys)
export const getDailyCheckinHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 30, 90);

    const history = await DailyCheckin.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("combinedScore dailyScore createdAt")
      .lean();

    res.json({
      success: true,
      data: history.map((entry) => ({
        timestamp: entry.createdAt,
        score: Math.round(entry.combinedScore * 100), // Convert 0-1 to 0-100
        dailyScore: Math.round(entry.dailyScore * 100),
      })),
    });
  } catch (error) {
    next(error);
  }
};

