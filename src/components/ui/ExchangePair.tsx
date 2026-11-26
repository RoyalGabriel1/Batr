import { ArrowLeftRight } from "lucide-react";

/** The BATR exchange glyph: a green circle with two arrows. */
export function ExchangeGlyph({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={[
        "inline-flex shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-primary",
        className ?? "h-8 w-8",
      ].join(" ")}
    >
      <ArrowLeftRight className="h-[55%] w-[55%]" strokeWidth={2.25} />
    </span>
  );
}

/** The exchange pair, stacked: what is offered, then what is wanted. */
export function ExchangeTerms({
  offering,
  wants,
  className,
}: {
  offering: string;
  wants: string;
  className?: string;
}) {
  return (
    <div
      className={[
        "rounded-xl border border-border-default bg-bg-surface p-5 shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div>
        <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">Offering</p>
        <p className="mt-1 text-body text-text-primary">{offering}</p>
      </div>
      <div className="my-4 flex items-center gap-3">
        <ExchangeGlyph className="h-7 w-7" />
        <span className="h-px flex-1 bg-border-default" />
      </div>
      <div>
        <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">In return</p>
        <p className="mt-1 text-body text-text-primary">{wants}</p>
      </div>
    </div>
  );
}
