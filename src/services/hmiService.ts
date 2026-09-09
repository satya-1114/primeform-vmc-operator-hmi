/**
 * Phase 2: REST-backed service layer.
 *
 * Every UI surface reads through this module. The Express API + MongoDB Atlas
 * is now the single source of truth — there is no client-side mock state.
 */
import { apiRequest } from "@/lib/apiClient";
import type {
  JobSetup,
  Machine,
  MachineCheck,
  OperationStatus,
  RequiredTool,
  StartupProgress,
  WorkpieceCheck,
} from "@/types/hmi";

export interface HmiService {
  getHealth(): Promise<{ status: string; database: string }>;
  getMachine(): Promise<Machine>;
  getSetup(): Promise<JobSetup>;
  getMachineChecks(): Promise<MachineCheck[]>;
  confirmMachineCheck(id: string): Promise<MachineCheck[]>;
  getTools(): Promise<RequiredTool[]>;
  confirmTool(id: string): Promise<RequiredTool[]>;
  getWorkpieceChecks(): Promise<WorkpieceCheck[]>;
  confirmWorkpieceCheck(id: string): Promise<WorkpieceCheck[]>;
  getProgress(): Promise<StartupProgress>;
  getOperation(): Promise<OperationStatus>;
  advanceWorkflow(): Promise<OperationStatus>;
  startOperation(): Promise<OperationStatus>;
  stopOperation(): Promise<OperationStatus>;
  resetWorkflow(): Promise<OperationStatus>;
}

export const hmiService: HmiService = {
  getHealth: () => apiRequest<{ status: string; database: string }>("/api/health"),
  getMachine: () => apiRequest<Machine>("/api/machine"),
  getSetup: () => apiRequest<JobSetup>("/api/setup"),
  getMachineChecks: () => apiRequest<MachineCheck[]>("/api/machine-checks"),
  confirmMachineCheck: (id) =>
    apiRequest<MachineCheck[]>(`/api/machine-checks/${encodeURIComponent(id)}/confirm`, {
      method: "PATCH",
    }),
  getTools: () => apiRequest<RequiredTool[]>("/api/tools"),
  confirmTool: (id) =>
    apiRequest<RequiredTool[]>(`/api/tools/${encodeURIComponent(id)}/confirm`, {
      method: "PATCH",
    }),
  getWorkpieceChecks: () => apiRequest<WorkpieceCheck[]>("/api/workpiece-checks"),
  confirmWorkpieceCheck: (id) =>
    apiRequest<WorkpieceCheck[]>(`/api/workpiece-checks/${encodeURIComponent(id)}/confirm`, {
      method: "PATCH",
    }),
  getProgress: () => apiRequest<StartupProgress>("/api/progress"),
  getOperation: () => apiRequest<OperationStatus>("/api/operation"),
  advanceWorkflow: () => apiRequest<OperationStatus>("/api/workflow/advance", { method: "POST" }),
  startOperation: () => apiRequest<OperationStatus>("/api/operation/start", { method: "POST" }),
  stopOperation: () => apiRequest<OperationStatus>("/api/operation/stop", { method: "POST" }),
  resetWorkflow: () => apiRequest<OperationStatus>("/api/reset", { method: "POST" }),
};
