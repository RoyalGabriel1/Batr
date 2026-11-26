import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  FileCheckCorner,
  HandCoins,
  Handshake,
  MessagesSquare,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useStore } from "../lib/store";
import type { Offer } from "../lib/types";
import { HeroShowcase } from "../components/HeroShowcase";
import { Container } from "../components/ui/Container";
import { OfferCard } from "../components/ui/OfferCard";

const FEATURED = ["canon-ae1", "braids", "keychron-q1", "espresso"];

const STEPS = [
  {
    icon: Search,
    title: "Explore",
    body: "Browse goods, services and skills from people nearby. Save what catches your eye.",
  },
  {
    icon: HandCoins,
    title: "Propose",
    body: "Offer something of yours in return, and add cash when the values don't quite match.",
  },
  {
    icon: MessagesSquare,
    title: "Negotiate",
    body: "Counter back and forth. Every revision is kept, so both sides see exactly what changed.",
  },
  {
    icon: FileCheckCorner,
    title: "Agree and complete",
    body: "Accepted terms become a fixed agreement. Both sides confirm the handover to close it.",
  },
];

const TRUST = [
  {
    icon: ShieldCheck,
    title: "Private by default",
    body: "Proposals and agreements are visible only to their two parties.",
  },
  {
    icon: FileCheckCorner,
    title: "Versioned terms",
    body: "Every counteroffer is a revision. Changes need both sides to accept.",
  },
  {
    icon: HandCoins,
    title: "Cash top-ups",
    body: "Balance a swap with cash. One clear 3% fee, shared equally.",
  },
  {
    icon: BadgeCheck,
    title: "Verified members",
    body: "Ratings, trade history and safety tools on every profile.",
  },
  {
    icon: Camera,
    title: "Real photos only",
    body: "Offers show the actual thing on offer, never stock imagery.",
  },
  {
    icon: MessagesSquare,
    title: "One thread per deal",
    body: "Messages stay with the proposal through to the handover.",
  },
];

export function Home() {
  const { publicOffers, getOffer } = useStore();
  const featured = FEATURED.map((id) => getOffer(id)).filter((o): o is Offer => Boolean(o));
  const newest = [...publicOffers]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  return (
    <Container className="pt-6">
      <HeroShowcase offers={featured} />

      {/* How BATR works */}
      <section className="mt-20" aria-labelledby="how">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-body-sm font-semibold text-accent-primary">How BATR works</p>
            <h2 id="how" className="mt-1 font-display text-3xl sm:text-4xl">
              From “I have this” to “done deal”
            </h2>
          </div>
          <p className="max-w-md text-text-secondary">
            Every exchange has two parties who each give something. BATR keeps the terms fair, fixed
            and visible to both.
          </p>
        </div>

        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative rounded-2xl bg-bg-surface p-6 shadow-card">
              <span className="font-display absolute right-5 top-4 text-5xl text-border-default">
                {index + 1}
              </span>
              <span className="flex size-11 items-center justify-center rounded-full bg-accent-soft text-accent-primary">
                <step.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-body-sm text-text-secondary">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Newest offers */}
      <section className="mt-20" aria-labelledby="newest">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-body-sm font-semibold text-accent-primary">Fresh on BATR</p>
            <h2 id="newest" className="mt-1 font-display text-3xl sm:text-4xl">
              Newest offers
            </h2>
          </div>
          <Link
            to="/explore"
            className="inline-flex h-10 shrink-0 items-center gap-1 rounded-full px-4 text-body-sm font-semibold text-accent-primary transition hover:bg-accent-soft"
          >
            See all
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {newest.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </section>

      {/* Built for trust */}
      <section className="mt-20 grid gap-6 rounded-2xl bg-bg-surface p-6 shadow-card sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <p className="text-body-sm font-semibold text-accent-primary">Built for trust</p>
          <h2 className="mt-1 font-display text-3xl sm:text-4xl">Fair for both sides, by design</h2>
          <p className="mt-4 text-text-secondary">
            Cash is short, but skills and spare things aren’t. BATR turns them into value, with the
            safeguards a two-sided trade needs.
          </p>
          <Link
            to="/exchanges"
            className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-accent-primary px-6 font-semibold text-text-on-accent transition hover:bg-accent-primary-hover"
          >
            <Handshake className="size-5" aria-hidden="true" />
            See a live negotiation
          </Link>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {TRUST.map((item) => (
            <li key={item.title} className="flex gap-3 rounded-xl bg-bg-base p-4">
              <item.icon className="mt-0.5 size-5 shrink-0 text-accent-primary" aria-hidden="true" />
              <span>
                <span className="block text-body-sm font-semibold">{item.title}</span>
                <span className="mt-0.5 block text-body-sm text-text-secondary">{item.body}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
