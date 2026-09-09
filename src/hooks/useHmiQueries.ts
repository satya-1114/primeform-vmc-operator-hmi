import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { hmiService } from "@/services/hmiService";

export const hmiKeys = {
  machine: ["hmi", "machine"] as const,
  setup: ["hmi", "setup"] as const,
  machineChecks: ["hmi", "machine-checks"] as const,
  tools: ["hmi", "tools"] as const,
  workpieceChecks: ["hmi", "workpiece-checks"] as const,
  progress: ["hmi", "progress"] as const,
  operation: ["hmi", "operation"] as const,
};

const STATIC = { staleTime: 5 * 60 * 1000, retry: 1 } as const;
const LIVE = { retry: 1 } as const;

export const useMachine = () =>
  useQuery({ queryKey: hmiKeys.machine, queryFn: hmiService.getMachine, ...STATIC });

export const useSetup = () =>
  useQuery({ queryKey: hmiKeys.setup, queryFn: hmiService.getSetup, ...STATIC });

export const useMachineChecks = () =>
  useQuery({ queryKey: hmiKeys.machineChecks, queryFn: hmiService.getMachineChecks, ...LIVE });

export const useTools = () =>
  useQuery({ queryKey: hmiKeys.tools, queryFn: hmiService.getTools, ...LIVE });

export const useWorkpieceChecks = () =>
  useQuery({ queryKey: hmiKeys.workpieceChecks, queryFn: hmiService.getWorkpieceChecks, ...LIVE });

export const useProgress = () =>
  useQuery({ queryKey: hmiKeys.progress, queryFn: hmiService.getProgress, ...LIVE });

export const useOperation = () =>
  useQuery({ queryKey: hmiKeys.operation, queryFn: hmiService.getOperation, ...LIVE });

function useInvalidateWorkflow() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: hmiKeys.progress });
    void queryClient.invalidateQueries({ queryKey: hmiKeys.operation });
  };
}

export function useConfirmMachineCheck() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateWorkflow();

  return useMutation({
    mutationFn: (id: string) => hmiService.confirmMachineCheck(id),
    onSuccess: (checks) => {
      queryClient.setQueryData(hmiKeys.machineChecks, checks);
      invalidate();
    },
  });
}

export function useConfirmTool() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateWorkflow();

  return useMutation({
    mutationFn: (id: string) => hmiService.confirmTool(id),
    onSuccess: (tools) => {
      queryClient.setQueryData(hmiKeys.tools, tools);
      invalidate();
    },
  });
}

export function useConfirmWorkpieceCheck() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateWorkflow();

  return useMutation({
    mutationFn: (id: string) => hmiService.confirmWorkpieceCheck(id),
    onSuccess: (checks) => {
      queryClient.setQueryData(hmiKeys.workpieceChecks, checks);
      invalidate();
    },
  });
}

export function useAdvanceWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => hmiService.advanceWorkflow(),
    onSuccess: (operation) => {
      queryClient.setQueryData(hmiKeys.operation, operation);
      // The newly active stage owns its own list; refetch everything stage-scoped.
      void queryClient.invalidateQueries({ queryKey: hmiKeys.progress });
      void queryClient.invalidateQueries({ queryKey: hmiKeys.machineChecks });
      void queryClient.invalidateQueries({ queryKey: hmiKeys.tools });
      void queryClient.invalidateQueries({ queryKey: hmiKeys.workpieceChecks });
    },
  });
}

export function useStartOperation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => hmiService.startOperation(),
    onSuccess: (operation) => queryClient.setQueryData(hmiKeys.operation, operation),
  });
}

export function useStopOperation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => hmiService.stopOperation(),
    onSuccess: (operation) => queryClient.setQueryData(hmiKeys.operation, operation),
  });
}

export function useResetWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => hmiService.resetWorkflow(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["hmi"] });
    },
  });
}
