import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 border border-border bg-panel p-8 text-center">
      {children}
    </div>
  );
}

export function LoadingState({ message = "Loading HMI data…" }: { message?: string }) {
  return (
    <Shell>
      <Loader2 aria-hidden="true" className="h-6 w-6 animate-spin text-primary" />
      <p role="status" className="font-mono text-xs tracking-[0.16em] text-muted-foreground">
        {message}
      </p>
    </Shell>
  );
}

export function ErrorState({
  message = "Unable to load data.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <Shell>
      <AlertTriangle aria-hidden="true" className="h-6 w-6 text-fault" />
      <p className="text-sm text-foreground">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 inline-flex min-h-[44px] items-center border border-border px-4 text-sm font-medium text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Retry
        </button>
      ) : null}
    </Shell>
  );
}

export function EmptyState({ message = "Nothing to display." }: { message?: string }) {
  return (
    <Shell>
      <Inbox aria-hidden="true" className="h-6 w-6 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </Shell>
  );
}
