import mongoose, { Schema, Document } from "mongoose";

export interface IBaselineSurvey extends Document {
  userId: mongoose.Types.ObjectId;
  answers: Record<string, number>;
  score: number;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const baselineSurveySchema = new Schema<IBaselineSurvey>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one baseline per user; use update to replace
      index: true,
    },
    answers: {
      type: Schema.Types.Mixed,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const BaselineSurvey = mongoose.model<IBaselineSurvey>(
  "BaselineSurvey",
  baselineSurveySchema
);

