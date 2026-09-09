import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { ErrorState, LoadingState } from "@/components/feedback/States";
import { HMIHeader } from "@/components/hmi/HMIHeader";
import { JobContext } from "@/components/hmi/JobContext";
import { PrimaryAction } from "@/components/hmi/PrimaryAction";
import { StageProgress } from "@/components/hmi/StageProgress";
import { NEXT_LABEL } from "@/data/stages";
import { useAdvanceWorkflow } from "@/hooks/useHmiQueries";
import { useStartupWorkflow } from "@/hooks/useStartupWorkflow";
import { hmiService } from "@/services/hmiService";
import { MachineChecksStage } from "@/stages/MachineChecksStage";
import { OperationStage } from "@/stages/OperationStage";
import { ReadyReviewStage } from "@/stages/ReadyReviewStage";
import { ToolsStage } from "@/stages/ToolsStage";
import { WorkpieceStage } from "@/stages/WorkpieceStage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VMC-01 Operator HMI — Startup Guidance | Primeform Labs" },
      {
        name: "description",
        content:
          "Simulated Vertical Machining Center operator HMI guiding startup: machine checks, tools, workpiece setup, ready review and operation.",
      },
      { property: "og:title", content: "VMC-01 Operator HMI — Startup Guidance" },
      {
        property: "og:description",
        content:
          "Step-by-step simulated startup guidance for a single VMC operator: machine checks, tooling, workpiece setup and operation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OperatorHmiPage,
});

function OperatorHmiPage() {
  const { loading, error, refetchAll, machine, setup, progress, operation, stages, currentStage } =
    useStartupWorkflow();
  const advance = useAdvanceWorkflow();
  const queryClient = useQueryClient();

  // Developer-only reset hook (not an operator-facing control).
  useEffect(() => {
    const w = window as unknown as { __hmiResetWorkflow?: () => void };
    w.__hmiResetWorkflow = () => {
      void hmiService.resetWorkflow().then(() => queryClient.invalidateQueries());
    };
    return () => {
      delete w.__hmiResetWorkflow;
    };
  }, [queryClient]);

  const hint =
    currentStage === "OPERATION"
      ? "SIMULATED HMI — NO CNC HARDWARE CONNECTED"
      : advance.isError
        ? (advance.error as Error).message
        : "SERVER-VALIDATED STARTUP SEQUENCE";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <HMIHeader machine={machine} />
      <StageProgress stages={stages} />
      {machine && setup ? <JobContext machine={machine} setup={setup} /> : null}

      <main className="flex-1">
        {loading ? (
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <LoadingState message="LOADING MACHINE STATUS…" />
          </div>
        ) : error ? (
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <ErrorState
              message="SYSTEM CONNECTION ERROR — Unable to communicate with the HMI service."
              onRetry={refetchAll}
            />
          </div>
        ) : currentStage === "MACHINE_CHECKS" ? (
          <MachineChecksStage machine={machine} />
        ) : currentStage === "TOOLS" ? (
          <ToolsStage />
        ) : currentStage === "WORKPIECE" ? (
          <WorkpieceStage setup={setup} />
        ) : currentStage === "READY_REVIEW" ? (
          <ReadyReviewStage setup={setup} progress={progress} />
        ) : (
          <OperationStage machine={machine} setup={setup} operation={operation} />
        )}
      </main>

      <PrimaryAction
        label={advance.isPending ? "ADVANCING…" : NEXT_LABEL[currentStage]}
        disabled={
          loading ||
          Boolean(error) ||
          advance.isPending ||
          currentStage === "OPERATION" ||
          !(progress?.canAdvance ?? false)
        }
        hint={hint}
        onClick={() => advance.mutate()}
      />
    </div>
  );
}
