import { Cpu, Power, ShieldCheck } from "lucide-react";

import type { Machine } from "@/types/hmi";

interface HMIHeaderProps {
  machine?: Machine | undefined;
}

export function HMIHeader({ machine }: HMIHeaderProps) {
  return (
    <header className="border-b border-border bg-panel">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center border border-border bg-panel-strong text-primary"
          >
            <Cpu className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <p className="font-mono text-[0.7rem] tracking-[0.2em] text-muted-foreground">
              PRIMEFORM LABS
            </p>
            <h1 className="text-lg font-semibold tracking-wide text-foreground">
              {machine?.id ?? "VMC"}
              <span className="ml-2 font-mono text-xs tracking-[0.18em] text-muted-foreground">
                OPERATOR HMI
              </span>
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 border border-warning/50 bg-warning/10 px-3 py-1.5 font-mono text-xs tracking-[0.16em] text-warning">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-warning" />
            SIMULATION
          </span>
          <span className="inline-flex items-center gap-2 border border-border bg-panel-strong px-3 py-1.5 font-mono text-xs tracking-[0.16em] text-foreground">
            <Power aria-hidden="true" className="h-3.5 w-3.5 text-confirmed" />
            POWERED ON
          </span>
          <span className="inline-flex items-center gap-2 border border-border bg-panel-strong px-3 py-1.5 font-mono text-xs tracking-[0.16em] text-foreground">
            <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5 text-confirmed" />
            CONTROL AVAILABLE
          </span>
        </div>
      </div>
    </header>
  );
}
