import { ChecklistItem } from "@/components/checklist/ChecklistItem";
import { ChecklistProgress } from "@/components/checklist/ChecklistProgress";
import { ErrorState, LoadingState } from "@/components/feedback/States";
import { MachineStatus } from "@/components/hmi/MachineStatus";
import { StageShell } from "@/components/hmi/StageShell";
import { useConfirmMachineCheck, useMachineChecks } from "@/hooks/useHmiQueries";
import type { Machine } from "@/types/hmi";

interface MachineChecksStageProps {
  machine?: Machine | undefined;
}

export function MachineChecksStage({ machine }: MachineChecksStageProps) {
  const { data: checks, isLoading, isError, refetch } = useMachineChecks();
  const confirm = useConfirmMachineCheck();

  const confirmed = checks?.filter((check) => check.confirmed).length ?? 0;

  return (
    <StageShell
      title="MACHINE CHECKS"
      subtitle="Complete every machine readiness check before continuing."
    >
      {machine ? <MachineStatus machine={machine} /> : null}

      {isLoading ? (
        <LoadingState message="LOADING MACHINE CHECKS…" />
      ) : isError || !checks ? (
        <ErrorState message="Unable to load the machine checks." onRetry={() => void refetch()} />
      ) : (
        <>
          <ChecklistProgress confirmed={confirmed} total={checks.length} />
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
