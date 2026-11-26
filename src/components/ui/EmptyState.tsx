import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-default bg-bg-surface px-6 py-14 text-center">
      <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent-primary">
        {icon}
      </span>
      <h2 className="text-h4 text-text-primary">{title}</h2>
      <p className="mt-1 max-w-sm text-body-sm text-text-secondary">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
