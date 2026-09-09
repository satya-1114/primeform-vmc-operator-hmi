import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

interface PrimaryActionProps {
  label: string;
  hint?: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}

export function PrimaryAction({ label, hint, disabled = false, onClick }: PrimaryActionProps) {
  return (
    <div className="sticky bottom-0 z-10 border-t border-border bg-panel/95 backdrop-blur-[2px]">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="font-mono text-xs tracking-[0.14em] text-muted-foreground">{hint}</p>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 border border-primary bg-primary px-6 text-base font-semibold tracking-wide text-primary-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:border-border disabled:bg-panel-strong disabled:text-muted-foreground sm:w-auto"
        >
          {label}
          <ArrowRight aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
