import { CheckCircle2, Loader2, Lock } from "lucide-react";

import { ChecklistProgress } from "@/components/checklist/ChecklistProgress";
import { ErrorState, LoadingState } from "@/components/feedback/States";
import { StageShell } from "@/components/hmi/StageShell";
import { useConfirmTool, useTools } from "@/hooks/useHmiQueries";

export function ToolsStage() {
  const { data: tools, isLoading, isError, refetch } = useTools();
  const confirm = useConfirmTool();

  const confirmed = tools?.filter((tool) => tool.confirmed).length ?? 0;

  return (
    <StageShell
      title="REQUIRED TOOLS"
      subtitle="Load and confirm every tool required for this operation, in order."
    >
      {isLoading ? (
        <LoadingState message="LOADING REQUIRED TOOLS…" />
      ) : isError || !tools ? (
        <ErrorState message="Unable to load the required tools." onRetry={() => void refetch()} />
      ) : (
        <>
          <ChecklistProgress confirmed={confirmed} total={tools.length} label="TOOLS CONFIRMED" />
          <ul className="grid gap-3 sm:grid-cols-2">
            {tools.map((tool) => {
              const pending = confirm.isPending && confirm.variables === tool.id;
              const locked = !tool.unlocked && !tool.confirmed;

              return (
                <li
                  key={tool.id}
                  className={[
                    "flex flex-col border p-4",
                    tool.confirmed
                      ? "border-confirmed/60 bg-confirmed/8"
                      : "border-border bg-panel",
                  ].join(" ")}
                >
                  <p className="font-mono text-sm tracking-[0.14em] text-primary">
                    {tool.toolNumber}
                  </p>
                  <p className="mt-1 text-base font-semibold text-foreground">{tool.toolType}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
                  <p className="mt-2 font-mono text-xs tracking-[0.12em] text-muted-foreground">
                    OPERATION: {tool.requiredOperation.toUpperCase()}
                  </p>

                  {confirm.isError && confirm.variables === tool.id ? (
                    <p role="alert" className="mt-2 text-sm text-fault">
                      Unable to save confirmation. Please try again.
                    </p>
                  ) : null}

                  <button
                    type="button"
                    disabled={tool.confirmed || locked || pending}
                    onClick={() => confirm.mutate(tool.id)}
                    className={[
                      "mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 border px-4 text-sm font-semibold tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      tool.confirmed
                        ? "cursor-default border-confirmed/60 bg-confirmed/15 text-confirmed"
                        : locked
                          ? "cursor-not-allowed border-border bg-panel-strong text-muted-foreground"
                          : "border-primary bg-primary text-primary-foreground disabled:opacity-70",
                    ].join(" ")}
                  >
                    {tool.confirmed ? (
                      <>
                        <CheckCircle2 aria-hidden="true" className="h-4 w-4" /> CONFIRMED
                      </>
                    ) : pending ? (
                      <>
                        <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> CONFIRMING…
                      </>
                    ) : locked ? (
                      <>
                        <Lock aria-hidden="true" className="h-4 w-4" /> LOCKED
                      </>
                    ) : (
                      "CONFIRM TOOL"
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </StageShell>
  );
}
