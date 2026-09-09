import { CheckCircle2, Circle, Loader2, Lock } from "lucide-react";

import type { ChecklistEntry } from "@/types/hmi";

interface ChecklistItemProps {
  entry: ChecklistEntry;
  index: number;
  onConfirm: (id: string) => void;
  pending?: boolean;
  locked?: boolean;
  errorMessage?: string | null;
}

export function ChecklistItem({
  entry,
  index,
  onConfirm,
  pending = false,
  locked = false,
  errorMessage = null,
}: ChecklistItemProps) {
  const confirmed = entry.confirmed;
  const disabled = confirmed || pending || locked;

  return (
    <li
      className={[
        "flex flex-col gap-3 border p-4 transition-colors sm:flex-row sm:items-center sm:gap-4",
        confirmed ? "border-confirmed/60 bg-confirmed/8" : "border-border bg-panel",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center font-mono text-sm",
          confirmed
            ? "bg-confirmed text-confirmed-foreground"
            : "border border-border text-muted-foreground",
        ].join(" ")}
      >
        {index + 1}
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold text-foreground">{entry.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{entry.instruction}</p>
        <p
          className={[
            "mt-2 inline-flex items-center gap-1.5 font-mono text-xs tracking-[0.14em]",
            confirmed ? "text-confirmed" : "text-warning",
          ].join(" ")}
        >
          {confirmed ? (
            <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
          ) : (
            <Circle aria-hidden="true" className="h-4 w-4" />
          )}
          {confirmed ? "CONFIRMED" : "NOT CONFIRMED"}
        </p>
        {errorMessage ? (
          <p role="alert" className="mt-2 text-sm text-fault">
            {errorMessage}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => onConfirm(entry.id)}
        disabled={disabled}
        aria-label={confirmed ? `${entry.title} confirmed` : `Confirm check: ${entry.title}`}
        className={[
          "inline-flex min-h-[44px] w-full items-center justify-center gap-2 border px-4 text-sm font-semibold tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-44",
          confirmed
            ? "cursor-default border-confirmed/60 bg-confirmed/15 text-confirmed"
            : locked
              ? "cursor-not-allowed border-border bg-panel-strong text-muted-foreground"
              : "border-primary bg-primary text-primary-foreground disabled:opacity-70",
        ].join(" ")}
      >
        {confirmed ? (
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
          "CONFIRM CHECK"
        )}
      </button>
    </li>
  );
}
