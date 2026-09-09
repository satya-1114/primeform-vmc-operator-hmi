import { CheckCircle2 } from "lucide-react";

import { StageShell } from "@/components/hmi/StageShell";
import type { JobSetup, StartupProgress } from "@/types/hmi";

interface ReadyReviewStageProps {
  setup?: JobSetup | undefined;
  progress?: StartupProgress | undefined;
}

export function ReadyReviewStage({ setup, progress }: ReadyReviewStageProps) {
  const ready = progress?.startupComplete ?? false;

  const completion: Array<[string, string, boolean]> = progress
    ? [
        [
          "MACHINE",
          `${progress.machineChecks.confirmed} / ${progress.machineChecks.total} COMPLETE`,
          progress.machineChecksComplete,
        ],
        [
          "TOOLS",
          `${progress.tools.confirmed} / ${progress.tools.total} COMPLETE`,
          progress.toolsComplete,
        ],
        [
          "WORKPIECE",
          `${progress.workpieceChecks.confirmed} / ${progress.workpieceChecks.total} COMPLETE`,
          progress.workpieceComplete,
        ],
      ]
    : [];

  const details: Array<[string, string]> = setup
    ? [
        ["JOB", setup.jobName],
        ["QUANTITY", `${setup.quantity} pieces`],
        ["PROGRAM", setup.program],
        ["REVISION", setup.programRevision],
        ["DRAWING", `${setup.drawing} ${setup.drawingRevision}`],
        ["WORK OFFSET", setup.workOffset],
      ]
    : [];

  return (
    <StageShell
      title="READY REVIEW"
      subtitle="Final review of the startup sequence before simulated operation."
    >
      <div
        className={[
          "flex flex-col gap-2 border p-5",
          ready ? "border-confirmed/60 bg-confirmed/8" : "border-warning/60 bg-panel",
        ].join(" ")}
      >
        <p className="font-mono text-[0.65rem] tracking-[0.18em] text-muted-foreground">
          STARTUP STATUS
        </p>
        <p
          className={[
            "inline-flex items-center gap-2 text-2xl font-bold tracking-wide",
            ready ? "text-confirmed" : "text-warning",
          ].join(" ")}
        >
          {ready ? <CheckCircle2 aria-hidden="true" className="h-6 w-6" /> : null}
          {ready ? "READY" : "NOT READY"}
        </p>
        <p className="text-sm text-muted-foreground">
          {ready
            ? "All startup arrangements have been confirmed."
            : "Some startup arrangements are still outstanding."}
        </p>
      </div>

      <dl className="grid gap-px border border-border bg-border sm:grid-cols-3">
        {completion.map(([label, value, done]) => (
          <div key={label} className="bg-panel p-4">
            <dt className="font-mono text-[0.65rem] tracking-[0.18em] text-muted-foreground">
              {label}
            </dt>
            <dd
              className={[
                "font-mono text-sm font-semibold tracking-[0.12em]",
                done ? "text-confirmed" : "text-warning",
              ].join(" ")}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <dl className="grid gap-px border border-border bg-border sm:grid-cols-2">
        {details.map(([label, value]) => (
          <div key={label} className="bg-panel p-4">
            <dt className="font-mono text-[0.65rem] tracking-[0.18em] text-muted-foreground">
              {label}
            </dt>
            <dd className="text-sm font-medium text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </StageShell>
  );
}
