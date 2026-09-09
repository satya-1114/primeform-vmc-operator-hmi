import { Construction } from "lucide-react";

interface StagePlaceholderProps {
  message: string;
  scope: string[];
}

export function StagePlaceholder({ message, scope }: StagePlaceholderProps) {
  return (
    <div className="border border-border bg-panel p-5">
      <p className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.16em] text-warning">
        <Construction aria-hidden="true" className="h-4 w-4" />
        PLANNED FOR NEXT WORKFLOW PHASE
      </p>
      <p className="mt-3 text-sm text-foreground">{message}</p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {scope.map((item) => (
          <li
            key={item}
            className="border border-border bg-panel-strong px-3 py-2 text-sm text-muted-foreground"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
