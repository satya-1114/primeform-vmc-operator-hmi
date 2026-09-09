import { AlertTriangle, ArrowRight, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface PrimaryActionProps {
  label: string;
  hint?: ReactNode;
  disabled?: boolean;
  onClick: () => void;
  resetError?: Error | null;
  resetPending?: boolean;
  onReset: () => void;
}

export function PrimaryAction({
  label,
  hint,
  disabled = false,
  onClick,
  resetError,
  resetPending = false,
  onReset,
}: PrimaryActionProps) {
  return (
    <div className="sticky bottom-0 z-10 border-t border-border bg-panel/95 backdrop-blur-[2px]">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
          {resetError ? (
            <p role="alert" className="flex items-center gap-2 text-xs text-destructive">
              <AlertTriangle aria-hidden="true" className="h-4 w-4 shrink-0" />
              {resetError.message}
            </p>
          ) : (
            <span />
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={resetPending}
                className="w-full border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto"
              >
                <RotateCcw aria-hidden="true" />
                {resetPending ? "RESETTING…" : "RESET DEMO"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset Demo?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will clear all confirmations and return the startup sequence to Machine
                  Checks.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>CANCEL</AlertDialogCancel>
                <AlertDialogAction
                  disabled={resetPending}
                  onClick={onReset}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {resetPending ? "RESETTING…" : "RESET DEMO"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
