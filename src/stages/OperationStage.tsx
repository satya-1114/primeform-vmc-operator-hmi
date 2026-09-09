import { Loader2, Play, Square } from "lucide-react";
import { useEffect, useState } from "react";

import { StageShell } from "@/components/hmi/StageShell";
import { useStartOperation, useStopOperation } from "@/hooks/useHmiQueries";
import type { JobSetup, Machine, OperationStatus } from "@/types/hmi";

function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = String(Math.floor(total / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const seconds = String(total % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

interface OperationStageProps {
  machine?: Machine | undefined;
  setup?: JobSetup | undefined;
  operation?: OperationStatus | undefined;
}

export function OperationStage({ machine, setup, operation }: OperationStageProps) {
  const start = useStartOperation();
  const stop = useStopOperation();
  const [now, setNow] = useState(() => Date.now());

  const state = operation?.state ?? "READY";
  const running = state === "RUNNING";

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const startedAt = operation?.startedAt ? new Date(operation.startedAt).getTime() : null;
  const stoppedAt = operation?.stoppedAt ? new Date(operation.stoppedAt).getTime() : null;
  const elapsed =
    startedAt === null ? null : formatElapsed((running ? now : (stoppedAt ?? now)) - startedAt);

  const stateTone =
    state === "RUNNING" ? "text-confirmed" : state === "STOPPED" ? "text-fault" : "text-primary";

  const errorMessage = start.isError
    ? ((start.error as Error).message ?? "Unable to start the operation.")
    : stop.isError
      ? ((stop.error as Error).message ?? "Unable to stop the operation.")
      : null;

  const rows: Array<[string, string]> = [
    ["OPERATION", setup?.operation ?? "—"],
    ["PROGRAM", setup?.program ?? "—"],
    ["REVISION", setup?.programRevision ?? "—"],
    ["MACHINE", machine?.id ?? "—"],
  ];

  return (
    <StageShell title="OPERATION" subtitle="Simulated operation control for the loaded job.">
      <dl className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {rows.map(([label, value]) => (
          <div key={label} className="bg-panel p-4">
            <dt className="font-mono text-[0.65rem] tracking-[0.18em] text-muted-foreground">
              {label}
            </dt>
            <dd className="text-sm font-medium text-foreground">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="border border-border bg-panel p-5">
        <p className="font-mono text-[0.65rem] tracking-[0.18em] text-muted-foreground">
          OPERATION STATE
        </p>
        <p className={`mt-1 text-3xl font-bold tracking-wide ${stateTone}`}>{state}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {running
            ? "OPERATION RUNNING"
            : state === "STOPPED"
              ? "Operation stopped. Confirmations are preserved."
              : "Ready to start the simulated operation."}
        </p>

        {elapsed ? (
          <p className="mt-4 font-mono text-2xl tracking-[0.16em] text-foreground">{elapsed}</p>
        ) : null}

        <p className="mt-4 font-mono text-xs tracking-[0.16em] text-warning">
          SIMULATED OPERATION — NO CNC HARDWARE CONNECTED
        </p>

        {errorMessage ? (
          <p role="alert" className="mt-3 text-sm text-fault">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-5">
          {running ? (
            <button
              type="button"
              disabled={stop.isPending}
              onClick={() => stop.mutate()}
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 border border-fault bg-fault px-6 text-base font-semibold tracking-wide text-background disabled:opacity-70 sm:w-auto"
            >
              {stop.isPending ? (
                <>
                  <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" /> STOPPING…
                </>
              ) : (
                <>
                  <Square aria-hidden="true" className="h-5 w-5" /> STOP OPERATION
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              disabled={state === "STOPPED" || start.isPending}
              onClick={() => start.mutate()}
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 border border-primary bg-primary px-6 text-base font-semibold tracking-wide text-primary-foreground disabled:cursor-not-allowed disabled:border-border disabled:bg-panel-strong disabled:text-muted-foreground sm:w-auto"
            >
              {start.isPending ? (
                <>
                  <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" /> STARTING…
                </>
              ) : (
                <>
                  <Play aria-hidden="true" className="h-5 w-5" /> START OPERATION
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </StageShell>
  );
}
