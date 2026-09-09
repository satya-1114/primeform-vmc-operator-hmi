import { Check, Lock } from "lucide-react";

import type { Stage } from "@/types/hmi";

interface StageProgressProps {
  stages: Stage[];
}

export function StageProgress({ stages }: StageProgressProps) {
  return (
    <nav aria-label="Startup sequence progress" className="border-b border-border bg-panel">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
        <p className="mb-2 font-mono text-[0.7rem] tracking-[0.22em] text-muted-foreground">
          STARTUP SEQUENCE
        </p>
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {stages.map((stage, index) => {
            const isActive = stage.status === "active";
            const isDone = stage.status === "completed";
            return (
              <li
                key={stage.id}
                aria-current={isActive ? "step" : undefined}
                className={[
                  "flex items-center gap-2 border px-3 py-2.5 transition-colors",
                  isActive
                    ? "border-primary bg-primary/12 text-foreground"
                    : isDone
                      ? "border-confirmed/50 bg-confirmed/10 text-foreground"
                      : "border-border bg-panel-strong text-muted-foreground",
                ].join(" ")}
              >
                <span
                  aria-hidden="true"
                  className={[
                    "flex h-6 w-6 shrink-0 items-center justify-center font-mono text-xs",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isDone
                        ? "bg-confirmed text-confirmed-foreground"
                        : "border border-border",
                  ].join(" ")}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </span>
                <span className="truncate font-mono text-xs tracking-[0.12em]">
                  {stage.shortLabel}
                </span>
                {stage.status === "locked" ? (
                  <Lock aria-hidden="true" className="ml-auto h-3.5 w-3.5" />
                ) : null}
                <span className="sr-only">
                  {isActive ? "Active stage" : isDone ? "Completed" : "Locked"}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
