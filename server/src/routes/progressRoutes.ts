import { Router } from "express";

import { progressHandler } from "../controllers/operationController.js";

export const progressRoutes = Router();

progressRoutes.get("/", progressHandler);
