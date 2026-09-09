import { Schema, model } from "mongoose";

export interface RequiredToolDoc {
  machineId: string;
  toolNumber: string;
  toolType: string;
  description: string;
  requiredOperation: string;
  confirmed: boolean;
  confirmedAt: Date | null;
  sortOrder: number;
}

const requiredToolSchema = new Schema<RequiredToolDoc>(
  {
    machineId: { type: String, required: true, index: true },
    toolNumber: { type: String, required: true, unique: true },
    toolType: { type: String, required: true },
    description: { type: String, required: true },
    requiredOperation: { type: String, required: true },
    confirmed: { type: Boolean, default: false },
    confirmedAt: { type: Date, default: null },
    sortOrder: { type: Number, required: true },
  },
  { timestamps: true },
);

export const RequiredTool = model<RequiredToolDoc>("RequiredTool", requiredToolSchema);
