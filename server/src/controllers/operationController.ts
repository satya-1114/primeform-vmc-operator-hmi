import type { NextFunction, Request, Response } from "express";

import {
  advanceWorkflow,
  getOperationState,
  getProgress,
  resetWorkflow,
  serializeOperation,
  startOperation,
  stopOperation,
} from "../services/workflowService.js";

export async function getOperation(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: serializeOperation(await getOperationState()) });
  } catch (error) {
    next(error);
  }
}

export async function advanceHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: serializeOperation(await advanceWorkflow()) });
  } catch (error) {
    next(error);
  }
}

export async function startHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: serializeOperation(await startOperation()) });
  } catch (error) {
    next(error);
  }
}

export async function stopHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: serializeOperation(await stopOperation()) });
  } catch (error) {
    next(error);
  }
}

export async function resetHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: serializeOperation(await resetWorkflow()) });
  } catch (error) {
    next(error);
  }
}

export async function progressHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: await getProgress() });
  } catch (error) {
    next(error);
  }
}
