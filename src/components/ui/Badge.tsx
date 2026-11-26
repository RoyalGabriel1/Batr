import type { ReactNode } from "react";

export type BadgeTone =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "inverse"
  | "overlay";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-bg-subtle text-text-secondary",
  accent: "bg-accent-soft text-accent-primary",
  success: "bg-state-success-soft text-state-success",
  warning: "bg-state-warning-soft text-state-warning",
  danger: "bg-state-danger-soft text-state-danger",
  info: "bg-state-info-soft text-state-info",
  inverse: "bg-bg-inverse text-text-on-inverse",
  overlay: "bg-bg-surface/90 text-text-secondary backdrop-blur-sm shadow-sm",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-caption font-semibold",
        tones[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
