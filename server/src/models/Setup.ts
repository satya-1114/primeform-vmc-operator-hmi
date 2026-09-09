import { Schema, model } from "mongoose";

export interface SetupDoc {
  machineId: string;
  jobName: string;
  quantity: number;
  operation: string;
  material: string;
  drawing: string;
  drawingRevision: string;
  program: string;
  programRevision: string;
  fixture: string;
  workOffset: string;
}

const setupSchema = new Schema<SetupDoc>(
  {
    machineId: { type: String, required: true, unique: true },
    jobName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    operation: { type: String, required: true },
    material: { type: String, required: true },
    drawing: { type: String, required: true },
    drawingRevision: { type: String, required: true },
    program: { type: String, required: true },
    programRevision: { type: String, required: true },
    fixture: { type: String, required: true },
    workOffset: { type: String, required: true },
  },
  { timestamps: true },
);

export const Setup = model<SetupDoc>("Setup", setupSchema);
