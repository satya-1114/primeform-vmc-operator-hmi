import { useMemo } from "react";

import { STAGE_DEFINITIONS, STAGE_ORDER } from "@/data/stages";
import { useMachine, useOperation, useProgress, useSetup } from "@/hooks/useHmiQueries";
import type { Stage, StageId } from "@/types/hmi";

/**
 * Phase 2: the backend owns the workflow state machine.
 * This hook only projects the server-reported stage into UI shape.
 */
export function useStartupWorkflow() {
  const machineQuery = useMachine();
  const setupQuery = useSetup();
  const progressQuery = useProgress();
  const operationQuery = useOperation();

  const currentStage: StageId = operationQuery.data?.currentStage ?? "MACHINE_CHECKS";

  const stages = useMemo<Stage[]>(() => {
    const currentIndex = STAGE_ORDER.indexOf(currentStage);
    return STAGE_DEFINITIONS.map((stage) => {
      const index = STAGE_ORDER.indexOf(stage.id);
      const status: Stage["status"] =
        index < currentIndex ? "completed" : index === currentIndex ? "active" : "locked";
      return { ...stage, status };
    });
  }, [currentStage]);

  const loading =
    machineQuery.isLoading ||
    setupQuery.isLoading ||
    progressQuery.isLoading ||
    operationQuery.isLoading;

  const error =
    machineQuery.error ?? setupQuery.error ?? progressQuery.error ?? operationQuery.error ?? null;

  const refetchAll = () => {
    void machineQuery.refetch();
    void setupQuery.refetch();
    void progressQuery.refetch();
    void operationQuery.refetch();
  };

  return {
    loading,
    error,
    refetchAll,
    machine: machineQuery.data,
    setup: setupQuery.data,
    progress: progressQuery.data,
    operation: operationQuery.data,
    stages,
    currentStage,
  };
}
