import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftRight, ArrowRight } from "lucide-react";
import { CATEGORIES, HERO_CATEGORIES } from "../lib/constants";
import { initials } from "../lib/format";
import { useStore } from "../lib/store";
import type { Offer } from "../lib/types";

/** How long each featured offer stays on screen before the next one slides in. */
const ROTATE_MS = 5200;

function OfferCardFloat({ offer }: { offer: Offer }) {
  const { getMember, currentUserId } = useStore();
  const owner = getMember(offer.ownerId);
  const ownerName = offer.ownerId === currentUserId ? "You" : (owner?.name ?? "Member");

  return (
    <span className="absolute inset-x-3 bottom-12 flex flex-col rounded-xl bg-bg-surface p-4 text-text-primary shadow-lg sm:inset-x-auto sm:left-6 sm:w-80">
      <span className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-primary text-text-on-accent">
          <ArrowLeftRight className="size-4" aria-hidden="true" />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-body-sm font-semibold">{offer.title}</span>
          <span className="truncate text-caption text-text-secondary">
            <span className="text-accent-primary">In return:</span> {offer.wants}
          </span>
        </span>
      </span>
      <span className="mt-3 flex items-center gap-2 border-t border-border-default pt-3 text-caption text-text-secondary">
        <span
          aria-hidden="true"
          className="flex size-6 shrink-0 items-center justify-center rounded-full bg-bg-subtle text-caption font-semibold text-text-primary"
        >
          {initials(ownerName).charAt(0)}
        </span>
        {ownerName}
        <span className="ml-auto text-text-muted">{offer.area}</span>
      </span>
    </span>
  );
}

/**
 * The home hero: a dark split panel. The left column carries the copy and the
 * category rail; the right column is an auto-advancing horizontal carousel of
 * featured offers. Each slide is a full-bleed photo with a floating info card.
 * The track translates left by one viewport per step. Motion is skipped for
 * members who prefer reduced motion.
 */
export function HeroShowcase({ offers }: { offers: Offer[] }) {
  const [index, setIndex] = useState(0);
  const count = offers.length;
  const trackRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (count < 2 || prefersReducedMotion) return;
    const handle = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, ROTATE_MS);
    return () => window.clearInterval(handle);
  }, [count, prefersReducedMotion]);

  if (count === 0) return null;

  return (
    <section className="relative grid overflow-hidden rounded-2xl bg-bg-inverse text-text-on-inverse lg:min-h-[560px] lg:grid-cols-2">
      {/* Decorative radial glow, top-left. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-40 size-[40rem] rounded-full bg-[radial-gradient(closest-side,var(--color-accent-on-inverse),transparent)] opacity-10"
      />

      {/* Left column: copy. */}
      <div className="relative flex flex-col justify-center gap-6 px-6 py-12 sm:px-10 lg:py-16">
        <p className="inline-flex w-fit items-center gap-2 rounded-full border border-text-on-inverse/15 px-3 py-1 text-caption font-medium text-text-on-inverse-muted">
          <span className="size-1.5 rounded-full bg-accent-on-inverse" />
          Peer-to-peer exchange, live in Ibadan
        </p>
        <h1 className="font-display text-[2.75rem] leading-[1.05] sm:text-6xl lg:text-[4.25rem]">
          Trade what you <span className="italic text-accent-on-inverse">have</span> for what you{" "}
          <span className="italic text-accent-on-inverse">need</span>.
        </h1>
        <p className="max-w-lg text-lg text-text-on-inverse-muted">
          BATR is the marketplace where people swap products, services and skills, and top up with
          cash when it helps. Two people, two sides, one fair agreement.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/explore"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-accent-on-inverse px-6 font-semibold text-bg-inverse transition hover:brightness-110"
          >
            Explore offers
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            to="/offers/new"
            className="inline-flex h-12 items-center rounded-full border border-text-on-inverse-muted/50 px-6 font-semibold transition hover:border-text-on-inverse hover:bg-text-on-inverse/10"
          >
            Create an offer
          </Link>
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {HERO_CATEGORIES.map((id) => (
            <Link
              key={id}
              to={`/explore?cat=${id}`}
              className="inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-full border border-text-on-inverse/15 bg-text-on-inverse/5 px-4 text-body-sm font-medium transition hover:border-accent-on-inverse/60 hover:bg-text-on-inverse/10"
            >
              {CATEGORIES[id]}
            </Link>
          ))}
        </div>
      </div>

      {/* Right column: the sliding carousel. */}
      <div className="relative mx-5 mb-5 aspect-[4/3] overflow-hidden rounded-xl lg:m-0 lg:aspect-auto lg:rounded-none">
        <div
          ref={trackRef}
          className="flex h-full w-full"
          style={{
            transform: `translateX(-${index * 100}%)`,
            transition: prefersReducedMotion ? "none" : "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {offers.map((offer) => (
            <Link
              key={offer.id}
              to={`/offers/${offer.id}`}
              className="relative h-full w-full shrink-0"
              aria-label={offer.title}
            >
              {offer.photos[0] ? (
                <img
                  src={offer.photos[0]}
                  alt={offer.title}
                  loading="eager"
                  className="size-full object-cover"
                />
              ) : null}
              <OfferCardFloat offer={offer} />
            </Link>
          ))}
        </div>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-24 bg-linear-to-r from-bg-inverse to-transparent lg:block"
        />

        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 sm:left-auto sm:right-6">
          {offers.map((offer, position) => (
            <button
              key={offer.id}
              type="button"
              onClick={() => setIndex(position)}
              aria-label={`Show offer ${position + 1}`}
              aria-current={position === index}
              className={[
                "h-2 rounded-full bg-bg-surface transition-all",
                position === index ? "w-6" : "w-2 opacity-60",
              ].join(" ")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
