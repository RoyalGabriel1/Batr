import { initials } from "../../lib/format";

const sizes = {
  sm: "h-7 w-7 text-caption",
  md: "h-9 w-9 text-body-sm",
  lg: "h-12 w-12 text-body",
} as const;

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={[
        "inline-flex shrink-0 items-center justify-center rounded-full bg-bg-subtle font-semibold text-text-secondary ring-1 ring-inset ring-border-default",
        sizes[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {initials(name).charAt(0)}
    </span>
  );
}
