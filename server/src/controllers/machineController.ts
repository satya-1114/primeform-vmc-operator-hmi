import type { NextFunction, Request, Response } from "express";

import { ApiError } from "../middleware/errorHandler.js";
import { Machine } from "../models/Machine.js";
import { MACHINE_ID } from "../services/workflowService.js";

export async function getMachine(_req: Request, res: Response, next: NextFunction) {
  try {
    const machine = await Machine.findOne({ machineId: MACHINE_ID });
    if (!machine) {
      throw new ApiError(503, "NOT_SEEDED", "Machine data has not been seeded yet.");
    }

    res.json({
      success: true,
      data: {
        id: machine.machineId,
        name: machine.name,
        type: machine.type,
        machineState: machine.machineState,
        controlState: machine.controlState,
        simulated: machine.simulated,
      },
    });
  } catch (error) {
    next(error);
  }
}
