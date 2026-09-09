import { Schema, model } from "mongoose";

export const STAGES = [
  "MACHINE_CHECKS",
  "TOOLS",
  "WORKPIECE",
  "READY_REVIEW",
  "OPERATION",
] as const;
export type StageId = (typeof STAGES)[number];

export const OPERATION_STATES = ["READY", "RUNNING", "STOPPED"] as const;
export type OperationStateValue = (typeof OPERATION_STATES)[number];

export interface OperationStateDoc {
  machineId: string;
  currentStage: StageId;
  state: OperationStateValue;
  startedAt: Date | null;
  stoppedAt: Date | null;
}

const operationStateSchema = new Schema<OperationStateDoc>(
  {
    machineId: { type: String, required: true, unique: true },
    currentStage: { type: String, enum: STAGES, default: "MACHINE_CHECKS" },
    state: { type: String, enum: OPERATION_STATES, default: "READY" },
    startedAt: { type: Date, default: null },
    stoppedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const OperationState = model<OperationStateDoc>("OperationState", operationStateSchema);
