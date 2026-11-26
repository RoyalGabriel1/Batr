import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Handshake,
  History,
  ImageOff,
  Minus,
  Plus,
  Send,
  Undo2,
  X,
} from "lucide-react";
import { formatNaira, formatRating, platformFee, postedAge } from "../lib/format";
import { useStore } from "../lib/store";
import type { Revision, Thread as ThreadType } from "../lib/types";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { ProposeDialog } from "../components/ui/ProposeDialog";

function terms(thread: ThreadType, offerOwnerId: string, currentUserId: string) {
  const revision = thread.revisions[thread.revisions.length - 1];
  if (!revision) return { youGive: "—", theyGive: "—", cash: undefined as number | undefined };
  const youAreOwner = offerOwnerId === currentUserId;
  return {
    youGive: youAreOwner ? revision.ownerGives : revision.otherGives,
    theyGive: youAreOwner ? revision.otherGives : revision.ownerGives,
    cash: revision.cash,
  };
}

type Delta = { kind: "add" | "remove"; text: string };

/** What changed between two revisions, described from the proposer's side. */
function revisionDeltas(
  revision: Revision,
  prev: Revision | undefined,
  youAreProposer: boolean,
): Delta[] {
  if (!prev) return [];
  const deltas: Delta[] = [];
  const sides = [
    {
      now: [revision.otherGives],
      before: [prev.otherGives],
      who: youAreProposer ? "you give" : "they give",
    },
    {
      now: [revision.ownerGives],
      before: [prev.ownerGives],
      who: youAreProposer ? "they give" : "you give",
    },
  ];
  for (const side of sides) {
    for (const item of side.now) {
      if (!side.before.includes(item)) deltas.push({ kind: "add", text: `${item} (${side.who})` });
    }
    for (const item of side.before) {
      if (!side.now.includes(item)) deltas.push({ kind: "remove", text: `${item} (${side.who})` });
    }
  }
  const cashText = (cash: number | undefined) =>
    cash ? `${formatNaira(cash)} from ${youAreProposer ? "you" : "them"}` : "no cash";
  if (revision.cash !== prev.cash) {
    deltas.push({
      kind: (revision.cash ?? 0) >= (prev.cash ?? 0) ? "add" : "remove",
      text: `Cash: ${cashText(prev.cash)} → ${cashText(revision.cash)}`,
    });
  }
  return deltas;
}

function TypingDots() {
  return (
    <span className="inline-flex gap-0.5" aria-hidden="true">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="size-1.5 animate-bounce rounded-full bg-current motion-reduce:animate-none"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

function StatusPill({
  thread,
  myTurn,
  otherName,
}: {
  thread: ThreadType;
  myTurn: boolean;
  otherName: string;
}) {
  const pill =
    thread.status === "agreed"
      ? { label: "Agreed", cls: "bg-accent-soft text-accent-primary-hover", check: true }
      : thread.outcome === "declined"
        ? { label: "Declined", cls: "bg-bg-subtle text-text-secondary", check: false }
        : thread.outcome === "withdrawn"
          ? { label: "Withdrawn", cls: "bg-bg-subtle text-text-secondary", check: false }
          : thread.status === "closed"
            ? { label: "Closed", cls: "bg-bg-subtle text-text-secondary", check: false }
            : myTurn
              ? { label: "Your turn", cls: "bg-accent-primary text-text-on-accent", check: false }
              : {
                  label: `Waiting on ${otherName}`,
                  cls: "bg-state-warning-soft text-state-warning",
                  check: false,
                };

  return (
    <span
      className={[
        "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold sm:ml-auto",
        pill.cls,
      ].join(" ")}
    >
      {pill.check ? <Check className="size-4" aria-hidden="true" /> : null}
      {pill.label}
    </span>
  );
}

function RevisionRow({
  revision,
  prev,
  youAreProposer,
  latest,
  authorLabel,
  byYou,
}: {
  revision: Revision;
  prev: Revision | undefined;
  youAreProposer: boolean;
  latest: boolean;
  authorLabel: string;
  byYou: boolean;
}) {
  const deltas = revisionDeltas(revision, prev, youAreProposer);
  const cash = revision.cash;

  return (
    <li className="flex gap-3">
      <Avatar name={authorLabel} />
      <div className="min-w-0 flex-1 rounded-xl bg-bg-base p-3">
        <p className="text-sm">
          <span className="font-semibold">{byYou ? "You" : authorLabel}</span>{" "}
          {revision.n === 1 ? "proposed the exchange" : "sent a counteroffer"}
          <span className="text-text-muted">
            {" · Revision "}
            {revision.n}
            {" · "}
            {postedAge(revision.createdAt)}
          </span>
          {latest ? (
            <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent-primary-hover">
              Latest
            </span>
          ) : null}
        </p>

        {deltas.length > 0 ? (
          <ul className="mt-2 space-y-1">
            {deltas.map((delta, index) => (
              <li
                key={`${delta.kind}-${index}`}
                className={[
                  "flex items-center gap-2 text-sm",
                  delta.kind === "add" ? "text-accent-primary-hover" : "text-state-danger",
                ].join(" ")}
              >
                {delta.kind === "add" ? (
                  <Plus className="size-3.5" aria-label="Added" />
                ) : (
                  <Minus className="size-3.5" aria-label="Removed" />
                )}
                {delta.text}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-text-secondary">
            {"Gives "}
            {revision.otherGives}
            {cash ? ` + ${formatNaira(cash)}` : ""}
            {" for "}
            {revision.ownerGives}
          </p>
        )}
      </div>
    </li>
  );
}

export function Thread() {
  const { id } = useParams<{ id: string }>();
  const {
    getThread,
    getOffer,
    getMember,
    currentUserId,
    sendMessage,
    acceptProposal,
    counterProposal,
    declineProposal,
    withdrawProposal,
    markThreadRead,
  } = useStore();

  const thread = id ? getThread(id) : undefined;
  const [draft, setDraft] = useState("");
  const [counterOpen, setCounterOpen] = useState(false);
  const [toast, setToast] = useState<{ title: string; description: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const unread = thread?.unread ?? 0;

  useEffect(() => {
    if (id && unread > 0) markThreadRead(id);
  }, [id, unread, markThreadRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [thread?.messages.length]);

  const offer = thread ? getOffer(thread.offerId) : undefined;
  const ownerId = offer?.ownerId ?? "";

  const current = useMemo(
    () => (thread ? terms(thread, ownerId, currentUserId) : { youGive: "—", theyGive: "—", cash: undefined }),
    [thread, ownerId, currentUserId],
  );

  if (!thread) {
    return (
      <Container>
        <div className="py-24 text-center">
          <h1 className="text-4xl">Exchange not found</h1>
          <Link
            to="/exchanges"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-accent-primary px-5 font-semibold text-text-on-accent"
          >
            Back to Exchanges
          </Link>
        </div>
      </Container>
    );
  }

  const counterpart = getMember(thread.counterpartId);
  const counterpartLabel = counterpart?.name ?? "Member";
  const value = offer?.estimate;
  const fee = value ? platformFee(value) : undefined;
  const youAreOwner = ownerId === currentUserId;
  const youAreProposer = !thread.incoming;
  const myTurn = thread.status === "your_turn";
  const isOpen = thread.status === "your_turn" || thread.status === "waiting";
  const revision = thread.revisions[thread.revisions.length - 1];

  const submitCounter = (values: { value: string; cash?: number; note?: string }) => {
    counterProposal(thread.id, {
      ownerGives: youAreOwner ? values.value : current.theyGive,
      otherGives: youAreOwner ? current.theyGive : values.value,
      cash: values.cash,
      note: values.note,
    });
    setCounterOpen(false);
    setToast({
      title: "Counteroffer sent",
      description: `Revision ${thread.revisions.length + 1} is with ${counterpartLabel}.`,
    });
    window.setTimeout(() => setToast(null), 4000);
  };

  const send = () => {
    if (!draft.trim()) return;
    sendMessage(thread.id, draft);
    setDraft("");
  };

  return (
    <Container className="py-8 sm:py-10">
      <Link
        to="/exchanges"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Exchanges
      </Link>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
        {offer ? (
          <Link
            to={`/offers/${offer.id}`}
            className="size-20 shrink-0 overflow-hidden rounded-xl bg-bg-subtle"
          >
            {offer.photos[0] ? (
              <img src={offer.photos[0]} alt={offer.title} className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center text-text-muted">
                <ImageOff className="size-5" aria-hidden="true" />
              </div>
            )}
          </Link>
        ) : null}

        <div className="min-w-0">
          <p className="text-sm text-text-muted">
            {youAreProposer
              ? `Your proposal to ${counterpartLabel}`
              : `${counterpartLabel}’s proposal on your offer`}
          </p>
          <h1 className="text-3xl leading-tight sm:text-4xl">{offer?.title}</h1>
        </div>

        <StatusPill thread={thread} myTurn={myTurn} otherName={counterpartLabel} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl bg-bg-surface p-5 shadow-card sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl">Latest terms</h2>
              <span className="text-xs text-text-muted">
                {revision ? (
                  <>
                    {"Revision "}
                    {revision.n}
                    {" by "}
                    {revision.authorId === currentUserId ? "you" : getMember(revision.authorId)?.name ?? "Member"}
                    {" · "}
                    {postedAge(revision.createdAt)}
                  </>
                ) : null}
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-bg-base p-3">
                <p className="text-xs font-semibold text-text-muted">You give</p>
                <p className="mt-1 text-sm text-text-primary">{current.youGive}</p>
              </div>
              <div className="rounded-xl bg-bg-base p-3">
                <p className="text-xs font-semibold text-text-muted">They give</p>
                <p className="mt-1 text-sm text-text-primary">{current.theyGive}</p>
              </div>
            </div>

            {current.cash ? (
              <p className="mt-2 text-sm text-text-secondary">
                Plus{" "}
                <span className="tnum font-semibold text-text-primary">
                  {formatNaira(current.cash)}
                </span>{" "}
                on top.
              </p>
            ) : null}

            {revision?.note ? (
              <blockquote className="mt-4 rounded-xl border-l-4 border-accent-primary bg-bg-base px-4 py-3 text-sm">
                {`“${revision.note}” `}
                <span className="text-text-muted">
                  {"— "}
                  {revision.authorId === currentUserId
                    ? "You"
                    : getMember(revision.authorId)?.name ?? "Member"}
                </span>
              </blockquote>
            ) : null}

            {value && fee ? (
              <p className="tnum mt-4 text-xs text-text-muted">
                Exchange value {formatNaira(value)} · BATR fee {formatNaira(fee)},{" "}
                {formatNaira(Math.round(fee / 2))} each, charged on completion
              </p>
            ) : null}

            {isOpen ? (
              <div className="mt-6 flex flex-wrap gap-3 border-t border-border-default pt-6">
                {myTurn ? (
                  <>
                    <Button
                      onClick={() => acceptProposal(thread.id)}
                      className="h-12 rounded-full px-6 text-base font-semibold"
                    >
                      <Check className="size-4" aria-hidden="true" />
                      Accept terms
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setCounterOpen(true)}
                      className="h-12 rounded-full px-5"
                    >
                      Counteroffer
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        youAreProposer ? withdrawProposal(thread.id) : declineProposal(thread.id)
                      }
                      className="h-12 rounded-full px-5 text-state-danger hover:bg-state-danger-soft hover:text-state-danger"
                    >
                      <X className="size-4" aria-hidden="true" />{" "}
                      {youAreProposer ? "Withdraw" : "Decline"}
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="flex items-center gap-2 rounded-full bg-state-warning-soft px-4 py-2 text-sm font-medium text-state-warning">
                      <TypingDots /> {counterpartLabel} is reviewing your terms…
                    </p>
                    {youAreProposer ? (
                      <Button
                        variant="ghost"
                        onClick={() => withdrawProposal(thread.id)}
                        className="h-10 rounded-full text-text-secondary"
                      >
                        <Undo2 className="size-4" aria-hidden="true" /> Withdraw
                      </Button>
                    ) : null}
                  </>
                )}
              </div>
            ) : null}

            {thread.status === "agreed" ? (
              <div className="mt-6 flex items-center gap-3 rounded-xl bg-bg-inverse p-4 text-text-on-inverse transition hover:brightness-110">
                <Handshake className="size-6 text-accent-on-inverse" aria-hidden="true" />
                <span>
                  <span className="block font-semibold">
                    Agreed. These terms are now an agreement.
                  </span>
                  <span className="text-sm text-text-on-inverse-muted">
                    Track the handover and complete the exchange →
                  </span>
                </span>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl bg-bg-surface p-5 shadow-card sm:p-6">
            <h2 className="flex items-center gap-2 text-2xl">
              <History className="size-5 text-accent-primary" aria-hidden="true" />
              Revision history
            </h2>
            <ol className="mt-4 space-y-4">
              {[...thread.revisions].reverse().map((item, index, arr) => {
                const author = getMember(item.authorId);
                return (
                  <RevisionRow
                    key={item.n}
                    revision={item}
                    prev={arr[index + 1]}
                    youAreProposer={youAreProposer}
                    latest={index === 0}
                    authorLabel={author?.name ?? "Member"}
                    byYou={item.authorId === currentUserId}
                  />
                );
              })}
            </ol>
          </section>
        </div>

        <section
          className="flex max-h-[640px] min-h-[420px] flex-col overflow-hidden rounded-2xl bg-bg-surface shadow-card lg:sticky lg:top-24"
          aria-label={`Messages with ${counterpartLabel}`}
        >
          <div className="flex items-center gap-3 border-b border-border-default p-4">
            <Avatar name={counterpartLabel} className="size-10" />
            <div>
              <p className="font-semibold">{counterpartLabel}</p>
              <p className="text-xs text-text-muted">
                {counterpart?.area} · ★ {formatRating(counterpart?.rating ?? 0)} ·{" "}
                {counterpart?.trades} trades
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {thread.messages.length === 0 ? (
              <p className="py-8 text-center text-sm text-text-muted">
                Say hello and agree on the details.
              </p>
            ) : null}
            {thread.messages.map((message) => {
              const mine = message.authorId === currentUserId;
              return (
                <div key={message.id} className={["flex", mine ? "justify-end" : "justify-start"].join(" ")}>
                  <div
                    className={[
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                      mine
                        ? "rounded-br-md bg-accent-primary text-text-on-accent"
                        : "rounded-bl-md bg-bg-subtle",
                    ].join(" ")}
                  >
                    {message.text}
                    <span
                      className={[
                        "mt-1 block text-[11px]",
                        mine ? "text-text-on-accent/70" : "text-text-muted",
                      ].join(" ")}
                    >
                      {postedAge(message.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <form
            className="flex gap-2 border-t border-border-default p-3"
            onSubmit={(event) => {
              event.preventDefault();
              send();
            }}
          >
            <label htmlFor={`msg-${thread.id}`} className="sr-only">
              Message
            </label>
            <input
              id={`msg-${thread.id}`}
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={`Message ${counterpartLabel}`}
              className="h-11 flex-1 rounded-full border border-border-strong bg-bg-base px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
            />
            <Button
              type="submit"
              className="size-11 rounded-full"
              aria-label="Send"
              disabled={!draft.trim()}
            >
              <Send className="size-4" aria-hidden="true" />
            </Button>
          </form>
        </section>
      </div>

      <ProposeDialog
        open={counterOpen}
        onClose={() => setCounterOpen(false)}
        title="Counteroffer"
        fixedLabel="They give"
        fixedValue={current.theyGive}
        editableLabel="You give"
        editablePlaceholder="What you'll offer instead"
        editableDefault={current.youGive}
        submitLabel="Send counteroffer"
        estimate={value}
        onSubmit={submitCounter}
      />

      {toast ? (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border border-border-default bg-bg-surface p-4 shadow-lg"
        >
          <p className="text-sm font-semibold text-text-primary">{toast.title}</p>
          <p className="mt-1 text-sm text-text-muted">{toast.description}</p>
        </div>
      ) : null}
    </Container>
  );
}
