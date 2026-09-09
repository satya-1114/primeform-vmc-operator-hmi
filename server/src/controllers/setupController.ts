import type { NextFunction, Request, Response } from "express";

import { ApiError } from "../middleware/errorHandler.js";
import { Setup } from "../models/Setup.js";
import { MACHINE_ID } from "../services/workflowService.js";

export async function getSetup(_req: Request, res: Response, next: NextFunction) {
  try {
    const setup = await Setup.findOne({ machineId: MACHINE_ID });
    if (!setup) {
      throw new ApiError(503, "NOT_SEEDED", "Job setup data has not been seeded yet.");
    }

    res.json({
      success: true,
      data: {
        jobName: setup.jobName,
        quantity: setup.quantity,
        operation: setup.operation,
        material: setup.material,
        drawing: setup.drawing,
        drawingRevision: setup.drawingRevision,
        program: setup.program,
        programRevision: setup.programRevision,
        fixture: setup.fixture,
        workOffset: setup.workOffset,
      },
    });
  } catch (error) {
    next(error);
  }
}
