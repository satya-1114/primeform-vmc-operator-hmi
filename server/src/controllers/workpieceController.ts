import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { confirmWorkpieceCheck, listWorkpieceChecks } from "../services/workflowService.js";

const paramsSchema = z.object({ id: z.string().min(1).max(64) });

export async function getWorkpieceChecks(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await listWorkpieceChecks() });
  } catch (error) {
    next(error);
  }
}

export async function confirmWorkpieceCheckHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = paramsSchema.parse(req.params);
    res.json({ success: true, data: await confirmWorkpieceCheck(id) });
  } catch (error) {
    next(error);
  }
}
