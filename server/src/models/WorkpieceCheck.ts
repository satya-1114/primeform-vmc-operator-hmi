import { Schema, model } from "mongoose";

export interface WorkpieceCheckDoc {
  machineId: string;
  key: string;
  title: string;
  instruction: string;
  confirmed: boolean;
  confirmedAt: Date | null;
  sortOrder: number;
}

const workpieceCheckSchema = new Schema<WorkpieceCheckDoc>(
  {
    machineId: { type: String, required: true, index: true },
    key: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    confirmed: { type: Boolean, default: false },
    confirmedAt: { type: Date, default: null },
    sortOrder: { type: Number, required: true },
  },
  { timestamps: true },
);

export const WorkpieceCheck = model<WorkpieceCheckDoc>("WorkpieceCheck", workpieceCheckSchema);
