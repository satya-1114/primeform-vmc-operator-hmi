import { Router } from "express";

import { getMachine } from "../controllers/machineController.js";

export const machineRoutes = Router();

machineRoutes.get("/", getMachine);
