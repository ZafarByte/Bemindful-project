// src/server.ts
import express, { Request, Response } from "express";
import { serve } from "inngest/express";
import { inngest } from "./inngest/index";
import { logger } from "./utils/logger";
import { functions as inngestFunctions } from "./inngest/functions";
import { connectDB } from "./utils/db";
const app = express();
app.use(express.json());

// mount Inngest on /api/inngest
app.use("/api/inngest", serve({ client: inngest, functions: inngestFunctions }));

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello from the backend!");
});

app.get("/api/chat", (_req: Request, res: Response) => {
  res.send("How may I help you");
});

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
