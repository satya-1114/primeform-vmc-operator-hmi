export type MachineState = "POWERED_ON" | "POWERED_OFF";
export type ControlState = "AVAILABLE" | "UNAVAILABLE";

export interface Machine {
  id: string;
  name: string;
  type: string;
  machineState: MachineState;
  controlState: ControlState;
  simulated: boolean;
}

export interface JobSetup {
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

export type StageId = "MACHINE_CHECKS" | "TOOLS" | "WORKPIECE" | "READY_REVIEW" | "OPERATION";
export type StageStatus = "locked" | "active" | "completed";

export interface Stage {
  id: StageId;
  label: string;
  shortLabel: string;
  status: StageStatus;
}

export interface ChecklistEntry {
  id: string;
  title: string;
  instruction: string;
  confirmed: boolean;
  sortOrder: number;
}

export type MachineCheck = ChecklistEntry;
export type WorkpieceCheck = ChecklistEntry;

export interface RequiredTool {
  id: string;
  toolNumber: string;
  toolType: string;
  description: string;
  requiredOperation: string;
  confirmed: boolean;
  sortOrder: number;
  unlocked: boolean;
}

export type OperationState = "READY" | "RUNNING" | "STOPPED";

export interface OperationStatus {
  currentStage: StageId;
  state: OperationState;
  startedAt: string | null;
  stoppedAt: string | null;
}

export interface CountPair {
  confirmed: number;
  total: number;
}

export interface StartupProgress {
  machineChecks: CountPair;
  tools: CountPair;
  workpieceChecks: CountPair;
  machineChecksComplete: boolean;
  toolsComplete: boolean;
  workpieceComplete: boolean;
  startupComplete: boolean;
  currentStage: StageId;
  canAdvance: boolean;
}
