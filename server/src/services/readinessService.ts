import { MachineCheck } from "../models/MachineCheck.js";
import { RequiredTool } from "../models/RequiredTool.js";
import { WorkpieceCheck } from "../models/WorkpieceCheck.js";

export interface CountPair {
  confirmed: number;
  total: number;
}

export interface Readiness {
  machineChecks: CountPair;
  tools: CountPair;
  workpieceChecks: CountPair;
  machineChecksComplete: boolean;
  toolsComplete: boolean;
  workpieceComplete: boolean;
  startupComplete: boolean;
}

const complete = (pair: CountPair): boolean => pair.total > 0 && pair.confirmed === pair.total;

export async function getReadiness(machineId: string): Promise<Readiness> {
  const [
    machineTotal,
    machineConfirmed,
    toolTotal,
    toolConfirmed,
    workpieceTotal,
    workpieceConfirmed,
  ] = await Promise.all([
    MachineCheck.countDocuments({ machineId }),
    MachineCheck.countDocuments({ machineId, confirmed: true }),
    RequiredTool.countDocuments({ machineId }),
    RequiredTool.countDocuments({ machineId, confirmed: true }),
    WorkpieceCheck.countDocuments({ machineId }),
    WorkpieceCheck.countDocuments({ machineId, confirmed: true }),
  ]);

  const machineChecks = { confirmed: machineConfirmed, total: machineTotal };
  const tools = { confirmed: toolConfirmed, total: toolTotal };
  const workpieceChecks = { confirmed: workpieceConfirmed, total: workpieceTotal };

  const machineChecksComplete = complete(machineChecks);
  const toolsComplete = complete(tools);
  const workpieceComplete = complete(workpieceChecks);

  return {
    machineChecks,
    tools,
    workpieceChecks,
    machineChecksComplete,
    toolsComplete,
    workpieceComplete,
    startupComplete: machineChecksComplete && toolsComplete && workpieceComplete,
  };
}
