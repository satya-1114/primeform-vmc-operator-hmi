import type { Machine } from "@/types/hmi";

interface MachineStatusProps {
  machine: Machine;
}

export function MachineStatus({ machine }: MachineStatusProps) {
  const items = [
    { label: "MACHINE TYPE", value: machine.type },
    { label: "MACHINE STATE", value: machine.machineState.replace("_", " ") },
    { label: "CONTROL STATE", value: machine.controlState },
    { label: "MODE", value: machine.simulated ? "SIMULATED HMI" : "LIVE" },
  ];

  return (
    <dl className="grid grid-cols-1 border border-border bg-panel sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="border-b border-border p-3 last:border-b-0 sm:border-b-0">
          <dt className="font-mono text-[0.65rem] tracking-[0.18em] text-muted-foreground">
            {item.label}
          </dt>
          <dd className="text-sm font-semibold text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
