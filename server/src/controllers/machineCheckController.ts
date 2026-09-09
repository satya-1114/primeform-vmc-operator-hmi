import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { confirmMachineCheck, listMachineChecks } from "../services/workflowService.js";

const paramsSchema = z.object({ id: z.string().min(1).max(64) });

export async function getMachineChecks(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await listMachineChecks() });
  } catch (error) {
    next(error);
  }
}

export async function confirmMachineCheckHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = paramsSchema.parse(req.params);
    res.json({ success: true, data: await confirmMachineCheck(id) });
  } catch (error) {
    next(error);
  }
}
