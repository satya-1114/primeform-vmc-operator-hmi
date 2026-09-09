import { Router } from "express";

import {
  confirmMachineCheckHandler,
  getMachineChecks,
} from "../controllers/machineCheckController.js";

export const machineCheckRoutes = Router();

machineCheckRoutes.get("/", getMachineChecks);
machineCheckRoutes.patch("/:id/confirm", confirmMachineCheckHandler);
