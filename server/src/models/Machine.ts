import { Schema, model } from "mongoose";

export interface MachineDoc {
  machineId: string;
  name: string;
  type: string;
  machineState: "POWERED_ON" | "POWERED_OFF";
  controlState: "AVAILABLE" | "UNAVAILABLE";
  simulated: boolean;
}

const machineSchema = new Schema<MachineDoc>(
  {
    machineId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    machineState: { type: String, enum: ["POWERED_ON", "POWERED_OFF"], default: "POWERED_ON" },
    controlState: { type: String, enum: ["AVAILABLE", "UNAVAILABLE"], default: "AVAILABLE" },
    simulated: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Machine = model<MachineDoc>("Machine", machineSchema);
