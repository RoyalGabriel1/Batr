import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PackageOpen, Search, X } from "lucide-react";
import { CATEGORIES, CATEGORY_IDS } from "../lib/constants";
import type { OfferType } from "../lib/types";
import { useStore } from "../lib/store";
import { Container } from "../components/ui/Container";
import { OfferCard } from "../components/ui/OfferCard";

const TYPE_TABS: { id: OfferType | null; label: string }[] = [
  { id: null, label: "All" },
  { id: "item", label: "Items" },
  { id: "service", label: "Services" },
];

export function Explore() {
  const { publicOffers } = useStore();
  const [params, setParams] = useSearchParams();

  const q = params.get("q") ?? "";
  const activeCat = params.get("cat");
  const activeType = params.get("type");
  const query = q.toLowerCase();

  const results = useMemo(() => {
    return publicOffers
      .filter((offer) => offer.status !== "paused")
      .filter((offer) => (activeType ? offer.type === activeType : true))
      .filter((offer) => (activeCat ? offer.category === activeCat : true))
      .filter((offer) =>
        query ? [offer.title, offer.offering, offer.wants, offer.area].some((value) => value.toLowerCase().includes(query)) : true,
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [publicOffers, activeType, activeCat, query]);

  const setQuery = (value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set("q", value);
    else next.delete("q");
    setParams(next, { replace: true });
  };

  const setType = (id: OfferType | null) => {
    const next = new URLSearchParams(params);
    if (id) next.set("type", id);
    else next.delete("type");
    next.delete("cat");
    setParams(next, { replace: true });
  };

  const catLink = (cat: string | null) => {
    const next = new URLSearchParams(params);
    if (cat) next.set("cat", cat);
    else next.delete("cat");
    const search = next.toString();
    return search ? `/explore?${search}` : "/explore";
  };

  const chipClass = (active: boolean) =>
    [
      "inline-flex h-10 shrink-0 items-center rounded-full border px-4 text-sm font-medium whitespace-nowrap transition",
      active
        ? "border-accent-primary bg-accent-primary text-text-on-accent"
        : "border-border-default bg-bg-surface hover:border-border-strong",
    ].join(" ");

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl sm:text-5xl">Explore</h1>
          <p className="mt-2 text-text-secondary">
            Goods, services and skills from members around Ibadan, newest first.
          </p>
        </div>

        <form
          role="search"
          onSubmit={(event) => event.preventDefault()}
          className="relative w-full lg:w-96"
        >
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            aria-label="Search offers"
            placeholder="Search cameras, braids, tutoring…"
            value={q}
            onChange={(event) => setQuery(event.target.value)}
            className="h-12 w-full rounded-full border border-border-strong bg-bg-surface pr-4 pl-11 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
          />
        </form>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <div
          role="group"
          aria-label="Kind of offer"
          className="mr-2 inline-flex rounded-full bg-bg-subtle p-1"
        >
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.id ?? "all"}
              type="button"
              aria-pressed={activeType === tab.id}
              onClick={() => setType(tab.id)}
              className={[
                "h-8 rounded-full px-4 text-sm font-medium transition",
                activeType === tab.id
                  ? "bg-bg-surface shadow-sm"
                  : "text-text-secondary hover:text-text-primary",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="no-scrollbar mt-3 -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        <Link to={catLink(null)} className={chipClass(!activeCat)}>
          All categories
        </Link>
        {CATEGORY_IDS.map((id) => (
          <Link key={id} to={catLink(id)} className={chipClass(activeCat === id)}>
            {CATEGORIES[id]}
          </Link>
        ))}
      </div>

      <p className="mt-6 text-sm text-text-muted" aria-live="polite">
        {results.length} {results.length === 1 ? "offer" : "offers"}
        {q ? ` matching “${q}”` : ""}
      </p>

      {results.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-2xl bg-bg-inverse px-6 py-16 text-center text-text-on-inverse">
          <PackageOpen className="size-10 text-accent-on-inverse" aria-hidden="true" />
          <h2 className="mt-4 text-3xl">Nothing here yet</h2>
          <p className="mt-2 max-w-sm text-text-on-inverse-muted">
            Try another search or category. Or be the first: post what you have and say what you
            want.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              to="/explore"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-text-on-inverse-muted/50 px-5 text-sm font-semibold"
            >
              <X className="size-4" aria-hidden="true" />
              Clear filters
            </Link>
            <Link
              to="/offers/new"
              className="inline-flex h-11 items-center rounded-full bg-accent-on-inverse px-5 text-sm font-semibold text-bg-inverse"
            >
              Create an offer
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </Container>
  );
}
