import { Star } from "lucide-react";
import { formatRating } from "../../lib/format";

export function Rating({ value, className }: { value: number; className?: string }) {
  return (
    <span
      className={["inline-flex items-center gap-1 font-semibold", className].filter(Boolean).join(" ")}
    >
      <Star className="h-3.5 w-3.5 fill-current text-accent-primary" strokeWidth={0} aria-hidden="true" />
      <span className="tnum">{formatRating(value)}</span>
    </span>
  );
}
