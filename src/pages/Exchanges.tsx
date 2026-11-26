import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftRight, Check, ChevronRight, Clock, Handshake, Inbox } from "lucide-react";
import { formatNaira, postedAge } from "../lib/format";
import { useStore } from "../lib/store";
import type { Thread, ThreadStatus } from "../lib/types";
import { Container } from "../components/ui/Container";

const STATUS_RANK: Record<ThreadStatus, number> = {
  your_turn: 0,
  waiting: 1,
  agreed: 2,
  closed: 3,
};

type Tab = "turn" | "waiting" | "agreements" | "closed";

const TABS: { id: Tab; label: string }[] = [
  { id: "turn", label: "Your turn" },
  { id: "waiting", label: "Waiting" },
  { id: "agreements", label: "Agreements" },
  { id: "closed", label: "Closed" },
];

const EMPTY: Record<Tab, string> = {
  turn: "Nothing needs your reply right now.",
  waiting: "You’re not waiting on anyone. Find something on Explore and propose an exchange.",
  agreements: "Accepted proposals become agreements here.",
  closed: "Declined and withdrawn proposals appear here.",
};

/** Both sides of the latest revision, described from your point of view. */
function latestTerms(thread: Thread, offerOwnerId: string, currentUserId: string) {
  const revision = thread.revisions[thread.revisions.length - 1];
  if (!revision) return { youGive: "—", theyGive: "—" };
  const youAreOwner = offerOwnerId === currentUserId;
  return youAreOwner
    ? { youGive: revision.ownerGives, theyGive: revision.otherGives }
    : { youGive: revision.otherGives, theyGive: revision.ownerGives };
}

function StatTile({ label, value, tone }: { label: string; value: number; tone?: "primary" }) {
  return (
    <div
      className={[
        "rounded-2xl p-4",
        tone ? "bg-bg-inverse text-text-on-inverse" : "bg-bg-surface shadow-card",
      ].join(" ")}
    >
      <p className={["font-display text-4xl", tone ? "text-accent-on-inverse" : ""].join(" ")}>
        {value}
      </p>
      <p
        className={[
          "mt-1 text-xs font-medium",
          tone ? "text-text-on-inverse-muted" : "text-text-muted",
        ].join(" ")}
      >
        {label}
      </p>
    </div>
  );
}

function TabEmpty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border-default bg-bg-surface px-6 py-14 text-center">
      <Inbox className="size-8 text-text-muted" aria-hidden="true" />
      <p className="mt-3 max-w-sm text-text-secondary">{text}</p>
      <Link
        to="/explore"
        className="mt-5 inline-flex h-10 items-center rounded-full bg-accent-primary px-5 text-sm font-semibold text-text-on-accent"
      >
        Explore offers
      </Link>
    </div>
  );
}

function Thumbnail({ src, alt }: { src?: string; alt: string }) {
  return (
    <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-bg-subtle sm:size-20">
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-text-muted">
          <ArrowLeftRight className="size-5" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

function ProposalRow({ thread }: { thread: Thread }) {
  const { getOffer, getMember, currentUserId } = useStore();
  const offer = getOffer(thread.offerId);
  const counterpart = getMember(thread.counterpartId);
  const counterpartLabel = counterpart?.name ?? "Member";
  const title = offer?.title ?? "Offer";
  const terms = latestTerms(thread, offer?.ownerId ?? "", currentUserId);
  const revision = thread.revisions[thread.revisions.length - 1];
  const youAreOwner = (offer?.ownerId ?? "") === currentUserId;
  const lastActivity =
    thread.messages[thread.messages.length - 1]?.createdAt ??
    revision?.createdAt ??
    offer?.createdAt ??
    "";
  const isYourTurn = thread.status === "your_turn";
  const cashAmount = revision?.cash ?? 0;

  const cash =
    cashAmount > 0
      ? ` · ${formatNaira(cashAmount)} cash from ${youAreOwner ? counterpartLabel : "you"}`
      : "";

  const statusLabel = isYourTurn
    ? "Your turn"
    : thread.status === "waiting"
      ? `Waiting on ${counterpartLabel.split(" ")[0]}`
      : thread.outcome === "declined"
        ? "Declined"
        : "Withdrawn";

  const statusTone = isYourTurn
    ? "bg-accent-primary text-text-on-accent"
    : thread.status === "waiting"
      ? "bg-state-warning-soft text-state-warning"
      : "bg-bg-subtle text-text-secondary";

  return (
    <li>
      <Link
        to={`/exchanges/${thread.id}`}
        className="flex items-center gap-4 rounded-2xl bg-bg-surface p-3 shadow-card transition hover:shadow-card-hover sm:p-4"
      >
        <Thumbnail src={offer?.photos[0]} alt={title} />

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-xs text-text-muted">
            {thread.unread > 0 ? (
              <span className="size-2 rounded-full bg-accent-primary" aria-label="New activity" />
            ) : null}
            {thread.incoming ? `${counterpartLabel} → You` : `You → ${counterpartLabel}`}
            {" · Revision "}
            {thread.revisions.length}
            {" · "}
            {postedAge(lastActivity)}
          </p>

          <p className="font-display mt-0.5 truncate text-xl font-medium">{title}</p>

          <p className="truncate text-sm text-text-secondary">
            <ArrowLeftRight
              className="mr-1 inline size-3.5 text-accent-primary"
              aria-hidden="true"
            />
            {"You give "}
            {terms.youGive}
            {cash}
          </p>
        </div>

        <span
          className={[
            "hidden shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold sm:inline-flex",
            statusTone,
          ].join(" ")}
        >
          {isYourTurn ? (
            <ArrowLeftRight className="size-3.5" aria-hidden="true" />
          ) : (
            <Clock className="size-3.5" aria-hidden="true" />
          )}
          {statusLabel}
        </span>

        <ChevronRight className="size-5 shrink-0 text-text-muted" aria-hidden="true" />
      </Link>
    </li>
  );
}

function AgreementRow({ thread }: { thread: Thread }) {
  const { getOffer, getMember } = useStore();
  const offer = getOffer(thread.offerId);
  const counterpart = getMember(thread.counterpartId);
  const counterpartLabel = counterpart?.name ?? "Member";
  const title = offer?.title ?? "Offer";
  const revision = thread.revisions[thread.revisions.length - 1];
  const createdAt =
    thread.messages[thread.messages.length - 1]?.createdAt ??
    revision?.createdAt ??
    offer?.createdAt ??
    "";
  const completed = thread.outcome === "completed";

  return (
    <li>
      <Link
        to={`/exchanges/${thread.id}`}
        className="flex items-center gap-4 rounded-2xl bg-bg-surface p-3 shadow-card transition hover:shadow-card-hover sm:p-4"
      >
        <Thumbnail src={offer?.photos[0]} alt={title} />

        <div className="min-w-0 flex-1">
          <p className="text-xs text-text-muted">
            {"Agreement with "}
            {counterpartLabel}
            {" · "}
            {postedAge(createdAt)}
          </p>

          <p className="font-display mt-0.5 truncate text-xl font-medium">{title}</p>

          <p className="text-sm text-text-secondary">
            {completed ? "Both sides handed over" : "Arrange the handover and confirm your side"}
          </p>
        </div>

        <span
          className={[
            "hidden shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold sm:inline-flex",
            completed
              ? "bg-accent-soft text-accent-primary-hover"
              : "bg-state-info-soft text-state-info",
          ].join(" ")}
        >
          {completed ? (
            <Check className="size-3.5" aria-hidden="true" />
          ) : (
            <Handshake className="size-3.5" aria-hidden="true" />
          )}
          {completed ? "Completed" : "Agreed"}
        </span>

        <ChevronRight className="size-5 shrink-0 text-text-muted" aria-hidden="true" />
      </Link>
    </li>
  );
}

export function Exchanges() {
  const { threads } = useStore();
  const [tab, setTab] = useState<Tab>(() =>
    threads.some((t) => t.status === "your_turn") ? "turn" : "agreements",
  );

  const sorted = useMemo(
    () =>
      [...threads].sort((a, b) => {
        const byStatus = STATUS_RANK[a.status] - STATUS_RANK[b.status];
        if (byStatus !== 0) return byStatus;
        const aLast = a.messages[a.messages.length - 1]?.createdAt ?? a.revisions[0]?.createdAt ?? "";
        const bLast = b.messages[b.messages.length - 1]?.createdAt ?? b.revisions[0]?.createdAt ?? "";
        return bLast.localeCompare(aLast);
      }),
    [threads],
  );

  const lists: Record<Tab, Thread[]> = {
    turn: sorted.filter((t) => t.status === "your_turn"),
    waiting: sorted.filter((t) => t.status === "waiting"),
    agreements: sorted.filter((t) => t.status === "agreed"),
    closed: sorted.filter((t) => t.status === "closed"),
  };
  const current = lists[tab];

  return (
    <Container className="py-8 sm:py-10">
      <h1 className="text-4xl sm:text-5xl">Exchanges</h1>
      <p className="mt-2 text-text-secondary">
        Your proposals, counteroffers and agreements in one place.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3 sm:max-w-xl">
        <StatTile label="Your turn" value={lists.turn.length} tone="primary" />
        <StatTile label="Waiting" value={lists.waiting.length} />
        <StatTile label="Active agreements" value={lists.agreements.length} />
      </div>

      <div className="mt-8">
        <div role="tablist" className="inline-flex h-11 items-center rounded-full bg-bg-subtle p-1">
          {TABS.map((item) => {
            const active = tab === item.id;
            const count = lists[item.id].length;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.id)}
                className={[
                  "relative inline-flex h-full items-center justify-center gap-1.5 rounded-full border border-transparent px-4 py-1 text-sm font-medium whitespace-nowrap transition-all",
                  active
                    ? "bg-bg-base text-text-primary shadow-sm"
                    : "text-text-primary/60 hover:text-text-primary",
                ].join(" ")}
              >
                {item.label}
                {item.id === "turn" && count > 0 ? (
                  <span className="ml-1 rounded-full bg-accent-primary px-1.5 text-[11px] text-text-on-accent">
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          {current.length === 0 ? (
            <TabEmpty text={EMPTY[tab]} />
          ) : (
            <ul className="grid gap-3">
              {current.map((thread) =>
                thread.status === "agreed" ? (
                  <AgreementRow key={thread.id} thread={thread} />
                ) : (
                  <ProposalRow key={thread.id} thread={thread} />
                ),
              )}
            </ul>
          )}
        </div>
      </div>
    </Container>
  );
}
