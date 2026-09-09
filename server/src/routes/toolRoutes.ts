import { Router } from "express";

import { confirmToolHandler, getTools } from "../controllers/toolController.js";

export const toolRoutes = Router();

toolRoutes.get("/", getTools);
toolRoutes.patch("/:id/confirm", confirmToolHandler);
