import { Link } from "react-router-dom";
import { Bookmark, Heart, ImageOff } from "lucide-react";
import { OFFER_TYPES } from "../../lib/constants";
import { initials, postedAge } from "../../lib/format";
import type { Offer } from "../../lib/types";
import { useStore } from "../../lib/store";
import { ExchangeGlyph } from "./ExchangePair";

export function OfferCard({
  offer,
  className,
  interactive = true,
}: {
  offer: Offer;
  className?: string;
  /** When false the card is a static preview: no link, no like or save. */
  interactive?: boolean;
}) {
  const { isSaved, isLiked, toggleSaved, toggleLiked, getMember, currentUserId } = useStore();
  const owner = getMember(offer.ownerId);
  const saved = isSaved(offer.id);
  const liked = isLiked(offer.id);
  const ownerLabel = offer.ownerId === currentUserId ? "You" : (owner?.name ?? "Member");

  const shell = [
    "group flex flex-col rounded-2xl bg-bg-surface p-3 shadow-card transition",
    interactive ? "hover:-translate-y-0.5 hover:shadow-card-hover motion-reduce:transition-none" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const body = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-bg-subtle">
        {offer.photos[0] ? (
          <img
            src={offer.photos[0]}
            alt={offer.title}
            loading="lazy"
            className="size-full object-cover transition duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-text-muted">
            <ImageOff className="size-6" />
          </div>
        )}

        <span className="absolute left-3 top-3 inline-flex h-7 items-center rounded-full bg-bg-surface/95 px-3 text-caption font-medium text-text-primary shadow-sm">
          {OFFER_TYPES[offer.type]}
        </span>

        {interactive ? (
          <div className="absolute right-3 top-3 flex gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                toggleLiked(offer.id);
              }}
              aria-pressed={liked}
              aria-label={liked ? `Unlike ${offer.title}` : `Like ${offer.title}`}
              className="flex size-9 items-center justify-center rounded-full bg-bg-surface/95 text-text-primary shadow-sm backdrop-blur transition hover:scale-105 motion-reduce:transition-none"
            >
              <Heart className={liked ? "size-4 fill-state-danger text-state-danger" : "size-4"} />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                toggleSaved(offer.id);
              }}
              aria-pressed={saved}
              aria-label={saved ? `Remove ${offer.title} from saved` : `Save ${offer.title}`}
              className="flex size-9 items-center justify-center rounded-full bg-bg-surface/95 text-text-primary shadow-sm backdrop-blur transition hover:scale-105 motion-reduce:transition-none"
            >
              <Bookmark
                className={saved ? "size-4 fill-accent-primary text-accent-primary" : "size-4"}
              />
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-3">
        <h3 className="font-display line-clamp-2 text-xl font-medium leading-snug">{offer.title}</h3>
        <p className="mt-1 line-clamp-1 text-body-sm text-text-secondary">{offer.offering}</p>

        <div className="mt-3 flex items-center gap-2 text-caption text-text-muted">
          <span
            aria-hidden="true"
            className="flex size-6 shrink-0 items-center justify-center rounded-full bg-bg-subtle text-caption font-semibold text-text-primary"
          >
            {initials(ownerLabel).charAt(0)}
          </span>
          <span className="truncate font-medium text-text-primary">{ownerLabel}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{offer.area}</span>
          <span className="ml-auto shrink-0">{postedAge(offer.createdAt)}</span>
        </div>

        <div className="mt-3 flex items-center gap-3 rounded-xl bg-bg-base p-2.5">
          <ExchangeGlyph className="size-8" />
          <p className="line-clamp-2 text-caption">
            <span className="font-semibold text-accent-primary">In return: </span>
            {offer.wants}
          </p>
        </div>
      </div>
    </>
  );

  if (!interactive) {
    return <div className={shell}>{body}</div>;
  }

  return (
    <Link to={`/offers/${offer.id}`} className={shell}>
      {body}
    </Link>
  );
}
