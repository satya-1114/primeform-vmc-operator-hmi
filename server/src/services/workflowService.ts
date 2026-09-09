import { Types } from "mongoose";

import { ApiError } from "../middleware/errorHandler.js";
import { MachineCheck } from "../models/MachineCheck.js";
import { OperationState, type StageId } from "../models/OperationState.js";
import { RequiredTool } from "../models/RequiredTool.js";
import { WorkpieceCheck } from "../models/WorkpieceCheck.js";
import { getReadiness, type Readiness } from "./readinessService.js";

export const MACHINE_ID = "VMC-01";

const STAGE_ORDER: StageId[] = [
  "MACHINE_CHECKS",
  "TOOLS",
  "WORKPIECE",
  "READY_REVIEW",
  "OPERATION",
];

export function assertObjectId(id: string): void {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "INVALID_ID", "The provided identifier is not valid.");
  }
}

export async function getOperationState() {
  const state = await OperationState.findOne({ machineId: MACHINE_ID });
  if (!state) {
    throw new ApiError(
      503,
      "NOT_SEEDED",
      "The HMI database has not been seeded. Run the seed script first.",
    );
  }
  return state;
}

export function serializeOperation(state: {
  currentStage: StageId;
  state: string;
  startedAt: Date | null;
  stoppedAt: Date | null;
}) {
  return {
    currentStage: state.currentStage,
    state: state.state,
    startedAt: state.startedAt ? state.startedAt.toISOString() : null,
    stoppedAt: state.stoppedAt ? state.stoppedAt.toISOString() : null,
  };
}

export async function listMachineChecks() {
  const checks = await MachineCheck.find({ machineId: MACHINE_ID }).sort({ sortOrder: 1 });
  return checks.map((check) => ({
    id: String(check._id),
    title: check.title,
    instruction: check.instruction,
    confirmed: check.confirmed,
    sortOrder: check.sortOrder,
  }));
}

export async function listWorkpieceChecks() {
  const checks = await WorkpieceCheck.find({ machineId: MACHINE_ID }).sort({ sortOrder: 1 });
  return checks.map((check) => ({
    id: String(check._id),
    title: check.title,
    instruction: check.instruction,
    confirmed: check.confirmed,
    sortOrder: check.sortOrder,
  }));
}

export async function listTools() {
  const tools = await RequiredTool.find({ machineId: MACHINE_ID }).sort({ sortOrder: 1 });
  return tools.map((tool, index) => ({
    id: String(tool._id),
    toolNumber: tool.toolNumber,
    toolType: tool.toolType,
    description: tool.description,
    requiredOperation: tool.requiredOperation,
    confirmed: tool.confirmed,
    sortOrder: tool.sortOrder,
    // Sequential rule: a tool unlocks only once every earlier tool is confirmed.
    unlocked: index === 0 ? true : tools.slice(0, index).every((prev) => prev.confirmed),
  }));
}

export async function confirmMachineCheck(id: string) {
  assertObjectId(id);
  const check = await MachineCheck.findOne({ _id: id, machineId: MACHINE_ID });
  if (!check) throw new ApiError(404, "CHECK_NOT_FOUND", "That machine check does not exist.");

  const state = await getOperationState();
  if (state.currentStage !== "MACHINE_CHECKS") {
    throw new ApiError(
      409,
      "STAGE_NOT_ACTIVE",
      "Machine checks can only be confirmed during the machine check stage.",
    );
  }

  if (!check.confirmed) {
    check.confirmed = true;
    check.confirmedAt = new Date();
    await check.save();
  }

  return listMachineChecks();
}

export async function confirmWorkpieceCheck(id: string) {
  assertObjectId(id);
  const check = await WorkpieceCheck.findOne({ _id: id, machineId: MACHINE_ID });
  if (!check) throw new ApiError(404, "CHECK_NOT_FOUND", "That workpiece check does not exist.");

  const state = await getOperationState();
  if (state.currentStage !== "WORKPIECE") {
    throw new ApiError(
      409,
      "STAGE_NOT_ACTIVE",
      "Workpiece checks can only be confirmed during the workpiece setup stage.",
    );
  }

  if (!check.confirmed) {
    check.confirmed = true;
    check.confirmedAt = new Date();
    await check.save();
  }

  return listWorkpieceChecks();
}

export async function confirmTool(id: string) {
  assertObjectId(id);
  const tool = await RequiredTool.findOne({ _id: id, machineId: MACHINE_ID });
  if (!tool) throw new ApiError(404, "TOOL_NOT_FOUND", "That tool does not exist.");

  const state = await getOperationState();
  if (state.currentStage !== "TOOLS") {
    throw new ApiError(
      409,
      "STAGE_NOT_ACTIVE",
      "Tools can only be confirmed during the tooling stage.",
    );
  }

  const previousUnconfirmed = await RequiredTool.countDocuments({
    machineId: MACHINE_ID,
    sortOrder: { $lt: tool.sortOrder },
    confirmed: false,
  });

  if (previousUnconfirmed > 0) {
    throw new ApiError(
      409,
      "TOOL_SEQUENCE_VIOLATION",
      `Confirm the preceding tools before confirming ${tool.toolNumber}.`,
    );
  }

  if (!tool.confirmed) {
    tool.confirmed = true;
    tool.confirmedAt = new Date();
    await tool.save();
  }

  return listTools();
}

function requirementForStage(
  stage: StageId,
  readiness: Readiness,
): { ok: boolean; message: string } {
  switch (stage) {
    case "MACHINE_CHECKS":
      return {
        ok: readiness.machineChecksComplete,
        message: "Confirm all machine checks before continuing.",
      };
    case "TOOLS":
      return {
        ok: readiness.toolsComplete,
        message: "Confirm all required tools before continuing.",
      };
    case "WORKPIECE":
      return {
        ok: readiness.workpieceComplete,
        message: "Confirm all workpiece setup items before continuing.",
      };
    case "READY_REVIEW":
      return {
        ok: readiness.startupComplete,
        message: "Complete all startup requirements before proceeding to operation.",
      };
    default:
      return { ok: false, message: "The startup sequence is already at its final stage." };
  }
}

export async function advanceWorkflow() {
  const state = await getOperationState();
  const readiness = await getReadiness(MACHINE_ID);
  const { ok, message } = requirementForStage(state.currentStage, readiness);

  if (state.currentStage === "OPERATION") {
    throw new ApiError(409, "ALREADY_AT_FINAL_STAGE", message);
  }
  if (!ok) {
    throw new ApiError(409, "STAGE_REQUIREMENTS_NOT_MET", message);
  }

  const nextStage = STAGE_ORDER[STAGE_ORDER.indexOf(state.currentStage) + 1] as StageId;
  state.currentStage = nextStage;
  await state.save();
  return state;
}

export async function startOperation() {
  const state = await getOperationState();
  const readiness = await getReadiness(MACHINE_ID);

  if (state.currentStage !== "OPERATION" || !readiness.startupComplete) {
    throw new ApiError(
      409,
      "WORKFLOW_NOT_READY",
      "Complete all startup requirements before starting the operation.",
    );
  }
  if (state.state === "RUNNING") {
    throw new ApiError(409, "INVALID_TRANSITION", "The operation is already running.");
  }
  if (state.state === "STOPPED") {
    throw new ApiError(
      409,
      "INVALID_TRANSITION",
      "The operation has been stopped. Reset the workflow to run it again.",
    );
  }

  state.state = "RUNNING";
  state.startedAt = new Date();
  state.stoppedAt = null;
  await state.save();
  return state;
}

export async function stopOperation() {
  const state = await getOperationState();

  if (state.state !== "RUNNING") {
    throw new ApiError(
      409,
      "INVALID_TRANSITION",
      "The operation can only be stopped while it is running.",
    );
  }

  state.state = "STOPPED";
  state.stoppedAt = new Date();
  await state.save();
  return state;
}

export async function resetWorkflow() {
  await Promise.all([
    MachineCheck.updateMany({ machineId: MACHINE_ID }, { confirmed: false, confirmedAt: null }),
    RequiredTool.updateMany({ machineId: MACHINE_ID }, { confirmed: false, confirmedAt: null }),
    WorkpieceCheck.updateMany({ machineId: MACHINE_ID }, { confirmed: false, confirmedAt: null }),
    OperationState.updateOne(
      { machineId: MACHINE_ID },
      { currentStage: "MACHINE_CHECKS", state: "READY", startedAt: null, stoppedAt: null },
      { upsert: true },
    ),
  ]);

  return getOperationState();
}

export async function getProgress() {
  const state = await getOperationState();
  const readiness = await getReadiness(MACHINE_ID);

  return {
    machineChecks: readiness.machineChecks,
    tools: readiness.tools,
    workpieceChecks: readiness.workpieceChecks,
    machineChecksComplete: readiness.machineChecksComplete,
    toolsComplete: readiness.toolsComplete,
    workpieceComplete: readiness.workpieceComplete,
    startupComplete: readiness.startupComplete,
    currentStage: state.currentStage,
    canAdvance:
      state.currentStage !== "OPERATION" && requirementForStage(state.currentStage, readiness).ok,
  };
}
