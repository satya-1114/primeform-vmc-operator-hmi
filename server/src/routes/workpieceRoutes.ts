import { Router } from "express";

import {
  confirmWorkpieceCheckHandler,
  getWorkpieceChecks,
} from "../controllers/workpieceController.js";

export const workpieceRoutes = Router();

workpieceRoutes.get("/", getWorkpieceChecks);
workpieceRoutes.patch("/:id/confirm", confirmWorkpieceCheckHandler);
