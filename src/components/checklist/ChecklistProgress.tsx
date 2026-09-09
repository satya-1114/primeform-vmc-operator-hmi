interface ChecklistProgressProps {
  confirmed: number;
  total: number;
  label?: string;
}

export function ChecklistProgress({
  confirmed,
  total,
  label = "CHECKS CONFIRMED",
}: ChecklistProgressProps) {
  const percent = total === 0 ? 0 : Math.round((confirmed / total) * 100);
  const complete = confirmed === total && total > 0;

  return (
    <div className="border border-border bg-panel p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-sm tracking-[0.14em] text-foreground">
          {confirmed} / {total} {label}
        </p>
        <p
          className={[
            "font-mono text-xs tracking-[0.14em]",
            complete ? "text-confirmed" : "text-muted-foreground",
          ].join(" ")}
        >
          {complete ? "COMPLETE" : `${percent}%`}
        </p>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={confirmed}
        aria-label={label.toLowerCase()}
        className="mt-3 h-2 w-full bg-panel-strong"
      >
        <div
          className={[
            "h-full transition-[width] duration-300 ease-out",
            complete ? "bg-confirmed" : "bg-primary",
          ].join(" ")}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
