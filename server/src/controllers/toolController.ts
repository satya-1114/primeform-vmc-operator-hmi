import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { confirmTool, listTools } from "../services/workflowService.js";

const paramsSchema = z.object({ id: z.string().min(1).max(64) });

export async function getTools(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await listTools() });
  } catch (error) {
    next(error);
  }
}

export async function confirmToolHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = paramsSchema.parse(req.params);
    res.json({ success: true, data: await confirmTool(id) });
  } catch (error) {
    next(error);
  }
}
