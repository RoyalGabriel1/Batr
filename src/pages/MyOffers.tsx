import { Link } from "react-router-dom";
import { ArrowLeftRight, Plus } from "lucide-react";
import { useStore } from "../lib/store";
import { Container } from "../components/ui/Container";
import { OfferCard } from "../components/ui/OfferCard";

export function MyOffers() {
  const { myOffers, threads } = useStore();

  const myOfferIds = new Set(myOffers.map((offer) => offer.id));
  const myThreads = threads.filter((thread) => myOfferIds.has(thread.offerId));
  const openProposals = myThreads.filter(
    (thread) => thread.status === "your_turn" || thread.status === "waiting",
  ).length;
  const completedExchanges = myThreads.filter((thread) => thread.status === "agreed").length;

  return (
    <Container className="py-8 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl sm:text-5xl">My offers</h1>
          <p className="mt-2 text-text-secondary">
            {`${myOffers.length} offers · ${openProposals} open proposal${
              openProposals === 1 ? "" : "s"
            } · ${completedExchanges} completed exchange${completedExchanges === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/exchanges"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-border-default bg-bg-surface px-5 text-sm font-semibold hover:border-border-strong"
          >
            <ArrowLeftRight className="size-4" aria-hidden="true" />
            Exchanges
          </Link>
          <Link
            to="/offers/new"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-accent-primary px-5 text-sm font-semibold text-text-on-accent hover:bg-accent-primary-hover"
          >
            <Plus className="size-4" aria-hidden="true" />
            Create offer
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {myOffers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
        <Link
          to="/offers/new"
          className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border-default text-text-secondary transition hover:border-accent-primary hover:text-accent-primary"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent-primary-hover">
            <Plus className="size-6" aria-hidden="true" />
          </span>
          <span className="font-semibold">Post something new</span>
        </Link>
      </div>
    </Container>
  );
}
