import { Link } from "react-router-dom";
import { Bookmark, ImageOff } from "lucide-react";
import { initials } from "../lib/format";
import { useStore } from "../lib/store";
import { Container } from "../components/ui/Container";

export function Saved() {
  const { savedOffers, getMember, toggleSaved } = useStore();

  return (
    <Container className="py-8 sm:py-10">
      <h1 className="text-4xl sm:text-5xl">Saved</h1>
      <p className="mt-2 text-text-secondary">Offers you’re keeping an eye on.</p>

      {savedOffers.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl bg-bg-inverse px-6 py-16 text-center text-text-on-inverse">
          <Bookmark className="size-10 text-accent-on-inverse" aria-hidden="true" />
          <h2 className="mt-4 text-3xl">Nothing saved yet</h2>
          <p className="mt-2 max-w-sm text-text-on-inverse-muted">
            Tap the bookmark on any offer to keep it here.
          </p>
          <Link
            to="/explore"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-accent-on-inverse px-5 text-sm font-semibold text-bg-inverse"
          >
            Browse offers
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-3">
          {savedOffers.map((offer) => {
            const ownerLabel = getMember(offer.ownerId)?.name ?? "Member";
            return (
              <li key={offer.id} className="relative">
                <Link
                  to={`/offers/${offer.id}`}
                  className="flex items-center gap-4 rounded-2xl bg-bg-surface p-3 pr-28 shadow-card transition hover:shadow-card-hover sm:p-4 sm:pr-32"
                >
                  <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-bg-subtle sm:size-24">
                    {offer.photos[0] ? (
                      <img
                        src={offer.photos[0]}
                        alt={offer.title}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-text-muted">
                        <ImageOff className="size-6" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display truncate text-xl font-medium">{offer.title}</p>
                    <p className="text-sm text-text-secondary">
                      {ownerLabel} · {offer.area}
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-sm">
                      <span
                        aria-hidden="true"
                        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-bg-subtle text-caption font-semibold text-text-primary"
                      >
                        {initials(ownerLabel).charAt(0)}
                      </span>
                      <span className="truncate">
                        <span className="font-semibold text-accent-primary">In return: </span>
                        {offer.wants}
                      </span>
                    </p>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => toggleSaved(offer.id)}
                  aria-label={`Remove ${offer.title} from saved`}
                  className="absolute top-1/2 right-4 -translate-y-1/2 flex size-9 items-center justify-center rounded-full border border-border-default bg-bg-surface text-text-primary shadow-sm transition hover:border-border-strong motion-reduce:transition-none"
                >
                  <Bookmark className="size-4 fill-accent-primary text-accent-primary" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Container>
  );
}
