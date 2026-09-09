import "dotenv/config";

import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { Machine } from "../models/Machine.js";
import { MachineCheck } from "../models/MachineCheck.js";
import { OperationState } from "../models/OperationState.js";
import { RequiredTool } from "../models/RequiredTool.js";
import { Setup } from "../models/Setup.js";
import { WorkpieceCheck } from "../models/WorkpieceCheck.js";

const MACHINE_ID = "VMC-01";

const machineChecks = [
  [
    "mc-01",
    "Power / Control Available",
    "Verify that machine power and CNC control are available.",
  ],
  ["mc-02", "E-Stop Released", "Verify that the emergency stop is released."],
  ["mc-03", "Guard / Door Closed", "Verify that all machine guards and doors are securely closed."],
  ["mc-04", "No Active Alarm", "Verify that the CNC control shows no active alarm."],
  [
    "mc-05",
    "Lubrication / Coolant Ready",
    "Verify that lubrication and coolant systems are ready.",
  ],
  [
    "mc-06",
    "Reference Return Complete",
    "Verify that machine axes have completed reference return.",
  ],
] as const;

const tools = [
  ["T01", "Ø50 Face Mill", "Face milling cutter", "Face milling"],
  ["T02", "Ø10 Carbide End Mill", "Carbide end mill", "Profile/slot machining"],
  ["T03", "Ø6 Carbide Drill", "Carbide drill", "Pilot drilling"],
  ["T04", "Ø10.2 Reamer", "Precision reamer", "Final hole sizing"],
] as const;

const workpieceChecks = [
  [
    "wp-01",
    "Fixture Installed",
    "Verify the 4-jaw precision machine vise with soft jaws is installed.",
  ],
  [
    "wp-02",
    "Workpiece Orientation Verified",
    "Seat the reference face against the fixed jaw and maintain the drawing orientation.",
  ],
  [
    "wp-03",
    "Workpiece Clamped",
    "Secure the workpiece firmly in the soft jaws and verify full seating.",
  ],
  ["wp-04", "Material Verified", "Verify the workpiece material is Aluminium 6061-T6."],
  ["wp-05", "Drawing Revision Verified", "Verify drawing BRK-204 Rev B."],
  ["wp-06", "Work Offset Verified", "Verify work offset G54 is selected."],
] as const;

export async function seedDatabase(): Promise<void> {
  // Deterministic: clear this machine's demo data, then recreate it.
  await Promise.all([
    Machine.deleteMany({ machineId: MACHINE_ID }),
    Setup.deleteMany({ machineId: MACHINE_ID }),
    MachineCheck.deleteMany({ machineId: MACHINE_ID }),
    RequiredTool.deleteMany({ machineId: MACHINE_ID }),
    WorkpieceCheck.deleteMany({ machineId: MACHINE_ID }),
    OperationState.deleteMany({ machineId: MACHINE_ID }),
  ]);

  await Machine.create({
    machineId: MACHINE_ID,
    name: MACHINE_ID,
    type: "Vertical Machining Center",
    machineState: "POWERED_ON",
    controlState: "AVAILABLE",
    simulated: true,
  });

  await Setup.create({
    machineId: MACHINE_ID,
    jobName: "BRK-204 Bracket Machining",
    quantity: 10,
    operation: "Face Milling + Drilling",
    material: "Aluminium 6061-T6",
    drawing: "BRK-204",
    drawingRevision: "Rev B",
    program: "BRK204_OP10.NC",
    programRevision: "Rev 03",
    fixture: "4-jaw precision machine vise + soft jaws",
    workOffset: "G54",
  });

  await MachineCheck.insertMany(
    machineChecks.map(([key, title, instruction], index) => ({
      machineId: MACHINE_ID,
      key,
      title,
      instruction,
      confirmed: false,
      confirmedAt: null,
      sortOrder: index + 1,
    })),
  );

  await RequiredTool.insertMany(
    tools.map(([toolNumber, toolType, description, requiredOperation], index) => ({
      machineId: MACHINE_ID,
      toolNumber,
      toolType,
      description,
      requiredOperation,
      confirmed: false,
      confirmedAt: null,
      sortOrder: index + 1,
    })),
  );

  await WorkpieceCheck.insertMany(
    workpieceChecks.map(([key, title, instruction], index) => ({
      machineId: MACHINE_ID,
      key,
      title,
      instruction,
      confirmed: false,
      confirmedAt: null,
      sortOrder: index + 1,
    })),
  );

  await OperationState.create({
    machineId: MACHINE_ID,
    currentStage: "MACHINE_CHECKS",
    state: "READY",
    startedAt: null,
    stoppedAt: null,
  });
}

const isDirectRun = process.argv[1]?.includes("seedDatabase");

if (isDirectRun) {
  connectDatabase()
    .then(seedDatabase)
    .then(() => {
      console.log("[seed] VMC-01 demo data seeded successfully.");
    })
    .catch((error: unknown) => {
      console.error("[seed] failed:", error instanceof Error ? error.message : error);
      process.exitCode = 1;
    })
    .finally(() => disconnectDatabase());
}
