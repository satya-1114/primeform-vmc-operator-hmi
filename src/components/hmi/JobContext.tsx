import type { JobSetup, Machine } from "@/types/hmi";

interface JobContextProps {
  machine: Machine;
  setup: JobSetup;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-l border-border px-3 py-2 first:border-l-0 first:pl-0">
      <dt className="font-mono text-[0.65rem] tracking-[0.18em] text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm font-medium text-foreground" title={value}>
        {value}
      </dd>
    </div>
  );
}

export function JobContext({ machine, setup }: JobContextProps) {
  return (
    <section aria-label="Job context" className="border-b border-border bg-panel-strong">
      <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-y-1 px-4 py-2 sm:grid-cols-3 sm:px-6 lg:grid-cols-5">
        <Field label="MACHINE" value={machine.id} />
        <Field label="JOB" value={setup.jobName} />
        <Field label="OPERATION" value={setup.operation} />
        <Field label="PROGRAM" value={setup.program} />
        <Field label="REV" value={setup.programRevision.replace("Rev ", "")} />
      </dl>
    </section>
  );
}
