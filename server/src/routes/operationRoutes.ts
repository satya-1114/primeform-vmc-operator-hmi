import { Router } from "express";

import {
  advanceHandler,
  getOperation,
  resetHandler,
  startHandler,
  stopHandler,
} from "../controllers/operationController.js";

export const operationRoutes = Router();
operationRoutes.get("/", getOperation);
operationRoutes.post("/start", startHandler);
operationRoutes.post("/stop", stopHandler);

export const workflowRoutes = Router();
workflowRoutes.post("/advance", advanceHandler);

export const resetRoutes = Router();
resetRoutes.post("/", resetHandler);
