import type { ReactNode } from "react";

interface StageShellProps {
  eyebrow?: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function StageShell({
  eyebrow = "CURRENT STAGE",
  title,
  subtitle,
  children,
}: StageShellProps) {
  return (
    <section aria-labelledby="stage-title" className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <p className="font-mono text-[0.7rem] tracking-[0.22em] text-primary">{eyebrow}</p>
      <h2
        id="stage-title"
        className="mt-1 text-2xl font-bold tracking-wide text-foreground sm:text-3xl"
      >
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">{subtitle}</p>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}
