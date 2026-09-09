import { ChecklistItem } from "@/components/checklist/ChecklistItem";
import { ChecklistProgress } from "@/components/checklist/ChecklistProgress";
import { ErrorState, LoadingState } from "@/components/feedback/States";
import { StageShell } from "@/components/hmi/StageShell";
import { useConfirmWorkpieceCheck, useWorkpieceChecks } from "@/hooks/useHmiQueries";
import type { JobSetup } from "@/types/hmi";

interface WorkpieceStageProps {
  setup?: JobSetup | undefined;
}

export function WorkpieceStage({ setup }: WorkpieceStageProps) {
  const { data: checks, isLoading, isError, refetch } = useWorkpieceChecks();
  const confirm = useConfirmWorkpieceCheck();

  const confirmed = checks?.filter((check) => check.confirmed).length ?? 0;

  const rows: Array<[string, string]> = setup
    ? [
        ["FIXTURE", setup.fixture],
        ["WORKPIECE", `${setup.drawing} bracket`],
        ["MATERIAL", setup.material],
        [
          "ORIENTATION",
          "Seat the reference face against the fixed jaw and maintain the drawing orientation.",
        ],
        ["CLAMPING", "Secure the workpiece firmly in the soft jaws and verify full seating."],
        ["DRAWING", `${setup.drawing} ${setup.drawingRevision}`],
        ["WORK OFFSET", setup.workOffset],
      ]
    : [];

  return (
    <StageShell
      title="WORKPIECE SETUP"
      subtitle="Install the fixture, seat the workpiece and verify the setup data."
    >
      {rows.length > 0 ? (
        <dl className="grid gap-px border border-border bg-border sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="bg-panel p-4">
              <dt className="font-mono text-[0.65rem] tracking-[0.18em] text-muted-foreground">
                {label}
              </dt>
              <dd className="text-sm font-medium text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {isLoading ? (
        <LoadingState message="LOADING WORKPIECE SETUP…" />
      ) : isError || !checks ? (
        <ErrorState message="Unable to load the setup items." onRetry={() => void refetch()} />
      ) : (
        <>
          <ChecklistProgress
            confirmed={confirmed}
            total={checks.length}
            label="SETUP ITEMS CONFIRMED"
          />
          <ul className="space-y-3">
            {checks.map((check, index) => (
              <ChecklistItem
                key={check.id}
                entry={check}
                index={index}
                pending={confirm.isPending && confirm.variables === check.id}
                errorMessage={
                  confirm.isError && confirm.variables === check.id
                    ? "Unable to save confirmation. Please try again."
                    : null
                }
                onConfirm={(id) => confirm.mutate(id)}
              />
            ))}
          </ul>
        </>
      )}
    </StageShell>
  );
}
