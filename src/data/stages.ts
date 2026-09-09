import type { StageId } from "@/types/hmi";

export const STAGE_ORDER: StageId[] = [
  "MACHINE_CHECKS",
  "TOOLS",
  "WORKPIECE",
  "READY_REVIEW",
  "OPERATION",
];

export const STAGE_DEFINITIONS: Array<{ id: StageId; label: string; shortLabel: string }> = [
  { id: "MACHINE_CHECKS", label: "Machine Checks", shortLabel: "MACHINE" },
  { id: "TOOLS", label: "Required Tools", shortLabel: "TOOLS" },
  { id: "WORKPIECE", label: "Workpiece Setup", shortLabel: "WORKPIECE" },
  { id: "READY_REVIEW", label: "Ready Review", shortLabel: "READY" },
  { id: "OPERATION", label: "Operation", shortLabel: "OPERATION" },
];

export const NEXT_LABEL: Record<StageId, string> = {
  MACHINE_CHECKS: "NEXT → TOOLS",
  TOOLS: "NEXT → WORKPIECE",
  WORKPIECE: "NEXT → READY",
  READY_REVIEW: "PROCEED TO OPERATION →",
  OPERATION: "OPERATION",
};
