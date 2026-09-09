import { Router } from "express";

import { getSetup } from "../controllers/setupController.js";

export const setupRoutes = Router();

setupRoutes.get("/", getSetup);
