// src/server.ts
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { serve } from "inngest/express";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";
import authRouter from "./routes/auth";
import chatRouter from "./routes/chat";
import moodRouter from "./routes/mood";
import activityRouter from "./routes/activity";
import { connectDB } from "./utils/db";
import { inngest } from "./inngest/client";
import { functions as inngestFunctions } from "./inngest/functions";

dotenv.config();

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use("/api/auth", authRouter);
// mount Inngest on /api/inngest
app.use("/api/inngest", serve({ client: inngest, functions: inngestFunctions }));

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello from the backend!");
});

app.get("/api/chat", (_req: Request, res: Response) => {
  res.send("How may I help you");
});

app.use("/auth", authRouter);
app.use("/chat", chatRouter);
app.use("/api/mood", moodRouter);
app.use("/api/activity", activityRouter);

app.use(errorHandler);
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT ?? 3001;
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Inngest endpoint available at http://localhost:${PORT}/api/inngest`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};


startServer();
