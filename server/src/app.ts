import cors from "cors";
import express, { type Express } from "express";

import { isDatabaseConnected } from "./config/database.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { machineCheckRoutes } from "./routes/machineCheckRoutes.js";
import { machineRoutes } from "./routes/machineRoutes.js";
import { operationRoutes, resetRoutes, workflowRoutes } from "./routes/operationRoutes.js";
import { progressRoutes } from "./routes/progressRoutes.js";
import { setupRoutes } from "./routes/setupRoutes.js";
import { toolRoutes } from "./routes/toolRoutes.js";
import { workpieceRoutes } from "./routes/workpieceRoutes.js";

/**
 * Comma-separated list of allowed browser origins.
 * Never falls back to "*" — deployments must supply their frontend origin.
 */
export function parseAllowedOrigins(value = process.env.CORS_ORIGIN): string[] {
  return (value ?? "http://localhost:8080")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function createApp(): Express {
  const app = express();
  const allowedOrigins = parseAllowedOrigins();

  app.disable("x-powered-by");

  app.use(
    cors({
      origin(origin, callback) {
        // Same-origin / server-to-server requests carry no Origin header.
        // Disallowed origins simply receive no CORS headers (no 500).
        callback(null, !origin || allowedOrigins.includes(origin));
      },
      methods: ["GET", "POST", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type"],
    }),
  );

  app.use(express.json({ limit: "64kb" }));

  // Works without seeded data: reports service and database state only.
  app.get("/api/health", (_req, res) => {
    const connected = isDatabaseConnected();
    const data = {
      status: connected ? "ok" : "degraded",
      database: connected ? "connected" : "disconnected",
    };

    if (connected) {
      res.status(200).json({ success: true, data });
      return;
    }

    // Same error envelope as every other endpoint, plus the diagnostic payload.
    res.status(503).json({
      success: false,
      data,
      error: {
        code: "DATABASE_UNAVAILABLE",
        message: "The HMI service cannot reach its database.",
      },
    });
  });

  app.use("/api/machine", machineRoutes);
  app.use("/api/setup", setupRoutes);
  app.use("/api/machine-checks", machineCheckRoutes);
  app.use("/api/tools", toolRoutes);
  app.use("/api/workpiece-checks", workpieceRoutes);
  app.use("/api/progress", progressRoutes);
  app.use("/api/operation", operationRoutes);
  app.use("/api/workflow", workflowRoutes);
  app.use("/api/reset", resetRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
