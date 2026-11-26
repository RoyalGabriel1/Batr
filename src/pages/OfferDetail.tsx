import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowLeftRight,
  BadgeCheck,
  Bookmark,
  CalendarDays,
  Check,
  Heart,
  ImageOff,
  Lock,
  MapPin,
  Share2,
  Star,
  Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CATEGORIES, CONDITIONS, HANDOVER_METHODS } from "../lib/constants";
import { formatNaira, formatRating, postedAge } from "../lib/format";
import { useStore } from "../lib/store";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { buttonClass } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { ExchangeGlyph } from "../components/ui/ExchangePair";
import { OfferCard } from "../components/ui/OfferCard";
import { ProposeDialog } from "../components/ui/ProposeDialog";

/** One "Where and how" row: an icon, a fixed-width term and its value. */
function DefinitionRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 p-4">
      <Icon className="mt-0.5 size-4 shrink-0 text-accent-primary" aria-hidden="true" />
      <dt className="w-20 shrink-0 font-medium">{label}</dt>
      <dd className="text-text-secondary">{value}</dd>
    </div>
  );
}

export function OfferDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getOffer,
    getMember,
    currentUserId,
    threads,
    startThread,
    publicOffers,
    isLiked,
    isSaved,
    toggleLiked,
    toggleSaved,
  } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const offer = id ? getOffer(id) : undefined;

  /** Same category first, then the freshest others. */
  const nearbyOffers = useMemo(() => {
    if (!offer) return [];
    const pool = publicOffers.filter((o) => o.id !== offer.id);
    const same = pool.filter((o) => o.category === offer.category);
    const rest = pool.filter((o) => o.category !== offer.category);
    return [...same, ...rest].slice(0, 4);
  }, [publicOffers, offer]);

  if (!offer) {
    return (
      <Container className="py-8 sm:py-10">
        <div className="py-24 text-center">
          <h1 className="font-display text-4xl">This offer isn’t available</h1>
          <p className="mt-2 text-text-secondary">It may have been closed or traded.</p>
          <Link
            to="/explore"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-accent-primary px-5 font-semibold text-text-on-accent"
          >
            Browse offers
          </Link>
        </div>
      </Container>
    );
  }

  const owner = getMember(offer.ownerId);
  const isMine = offer.ownerId === currentUserId;
  const ownerLabel = isMine ? "You" : (owner?.name ?? "Member");
  const liked = isLiked(offer.id);
  const saved = isSaved(offer.id);
  const offerThreads = threads.filter((t) => t.offerId === offer.id);
  // A proposal the signed-in member already made on someone else's offer.
  const myProposal = offerThreads.find((t) => !t.incoming);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Container className="py-8 sm:py-10">
      <Link
        to="/explore"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Explore
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-12">
        <div className="relative aspect-[4/3] self-start overflow-hidden rounded-2xl bg-bg-subtle shadow-card">
          {offer.photos[0] ? (
            <img
              src={offer.photos[0]}
              alt={offer.title}
              loading="eager"
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-text-muted">
              <ImageOff className="size-8" aria-hidden="true" />
            </div>
          )}

          <div className="absolute top-4 right-4 flex gap-2">
            <button
              type="button"
              onClick={() => toggleLiked(offer.id)}
              aria-pressed={liked}
              aria-label={liked ? `Unlike ${offer.title}` : `Like ${offer.title}`}
              className="flex size-9 items-center justify-center rounded-full bg-bg-surface/95 text-text-primary shadow-sm backdrop-blur transition hover:scale-105 motion-reduce:transition-none"
            >
              <Heart
                className={liked ? "size-4 fill-state-danger text-state-danger" : "size-4"}
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              onClick={() => toggleSaved(offer.id)}
              aria-pressed={saved}
              aria-label={saved ? `Remove ${offer.title} from saved` : `Save ${offer.title}`}
              className="flex size-9 items-center justify-center rounded-full bg-bg-surface/95 text-text-primary shadow-sm backdrop-blur transition hover:scale-105 motion-reduce:transition-none"
            >
              <Bookmark
                className={saved ? "size-4 fill-accent-primary text-accent-primary" : "size-4"}
                aria-hidden="true"
              />
            </button>
          </div>

          {offer.status === "closed" ? (
            <span className="absolute inset-x-4 bottom-4 rounded-full bg-bg-inverse/85 py-2 text-center text-sm font-semibold text-text-on-inverse">
              Traded on BATR
            </span>
          ) : null}
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="accent">{CATEGORIES[offer.category]}</Badge>
            <Badge>
              {offer.type === "service"
                ? "Service"
                : `Condition: ${CONDITIONS[offer.condition ?? "good"]}`}
            </Badge>
          </div>

          <h1 className="mt-4 font-display text-4xl leading-tight sm:text-[2.75rem]">
            {offer.title}
          </h1>

          <div className="mt-4 flex items-center gap-2 text-sm text-text-secondary">
            <Avatar name={ownerLabel} size="sm" />
            <span className="font-medium text-text-primary">{ownerLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{offer.area}</span>
            <span aria-hidden="true">·</span>
            <span>{postedAge(offer.createdAt)}</span>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-border-default bg-bg-surface">
            <div className="p-5">
              <p className="text-xs font-semibold text-text-muted">Offering</p>
              <p className="mt-1">{offer.offering}</p>
            </div>
            <div className="flex gap-3 border-t border-border-default bg-accent-soft/60 p-5">
              <ExchangeGlyph className="h-8 w-8 bg-bg-surface" />
              <div>
                <p className="text-xs font-semibold text-accent-primary-hover">In return</p>
                <p className="mt-1">{offer.wants}</p>
              </div>
            </div>
          </div>

          {offer.estimate ? (
            <p className="mt-3 text-xs text-text-muted">
              BATR estimate:{" "}
              <span className="tnum font-semibold text-text-primary">
                {formatNaira(offer.estimate)}
              </span>
              . Used to balance terms and quote the fee.
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            {isMine ? (
              <Link
                to="/exchanges"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-accent-primary px-6 font-semibold text-text-on-accent hover:bg-accent-primary-hover"
              >
                <ArrowLeftRight className="size-4" aria-hidden="true" />
                {offerThreads.length > 0
                  ? `${offerThreads.length} proposal${offerThreads.length > 1 ? "s" : ""} on this offer`
                  : "View exchanges"}
              </Link>
            ) : myProposal ? (
              <Link
                to={`/exchanges/${myProposal.id}`}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-accent-primary px-6 font-semibold text-text-on-accent hover:bg-accent-primary-hover"
              >
                <ArrowLeftRight className="size-4" aria-hidden="true" />
                View your proposal
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setDialogOpen(true)}
                className={buttonClass({
                  size: "lg",
                  className: "h-12 rounded-full px-6 text-base font-semibold",
                })}
              >
                <ArrowLeftRight className="size-4" aria-hidden="true" />
                Propose exchange
              </button>
            )}
            <button
              type="button"
              onClick={share}
              className={buttonClass({
                variant: "secondary",
                size: "lg",
                className: "h-12 rounded-full px-5",
              })}
            >
              {copied ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                <Share2 className="size-4" aria-hidden="true" />
              )}
              {copied ? "Link copied" : "Share"}
            </button>
          </div>

          <section className="mt-8">
            <h2 className="font-display text-2xl">About this offer</h2>
            <p className="mt-2 leading-relaxed text-text-secondary">{offer.description}</p>
          </section>

          <section className="mt-8">
            <h2 className="font-display text-2xl">Where and how</h2>
            <dl className="mt-3 divide-y divide-border-default rounded-2xl border border-border-default bg-bg-surface text-sm">
              <DefinitionRow icon={MapPin} label="Location" value={`${offer.area}, Ibadan`} />
              <DefinitionRow
                icon={ArrowLeftRight}
                label="Exchange"
                value={
                  offer.type === "service"
                    ? "Service for goods, services or cash"
                    : "Swap, or swap plus cash"
                }
              />
              <DefinitionRow
                icon={Truck}
                label="How"
                value={offer.handover.map((method) => HANDOVER_METHODS[method]).join(" · ")}
              />
              <DefinitionRow icon={CalendarDays} label="Posted" value={postedAge(offer.createdAt)} />
            </dl>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
              <Lock className="size-3.5" aria-hidden="true" />
              Exact addresses are shared only inside an agreement.
            </p>
          </section>

          {owner ? (
            <section className="mt-8 flex items-center gap-4 rounded-2xl bg-bg-surface p-5 shadow-card">
              <Avatar name={ownerLabel} size="lg" className="text-lg" />
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-semibold">
                  {ownerLabel}
                  <BadgeCheck className="size-4 text-accent-primary" aria-label="Verified member" />
                </p>
                <p className="text-sm text-text-secondary">
                  {owner.area} · Member since {owner.since}
                </p>
              </div>
              <div className="ml-auto text-right text-sm">
                <p className="flex items-center justify-end gap-1 font-semibold">
                  <Star
                    className="size-4 fill-state-warning text-state-warning"
                    aria-hidden="true"
                  />
                  {formatRating(owner.rating)}
                </p>
                <p className="text-text-secondary">{owner.trades} trades</p>
              </div>
            </section>
          ) : null}
        </div>
      </div>

      {nearbyOffers.length > 0 ? (
        <section className="mt-16">
          <h2 className="font-display text-3xl">
            More {offer.type === "service" ? "services" : "items"} nearby
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {nearbyOffers.map((item) => (
              <OfferCard key={item.id} offer={item} />
            ))}
          </div>
        </section>
      ) : null}

      <ProposeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Propose an exchange"
        fixedLabel="They give"
        fixedValue={offer.offering}
        editableLabel="You give"
        editablePlaceholder="What you'll offer in return"
        submitLabel="Send proposal"
        estimate={offer.estimate}
        onSubmit={(values) => {
          const thread = startThread(offer.id, {
            ownerGives: offer.offering,
            otherGives: values.value,
            cash: values.cash,
            note: values.note,
          });
          setDialogOpen(false);
          navigate(`/exchanges/${thread.id}`);
        }}
      />
    </Container>
  );
}
