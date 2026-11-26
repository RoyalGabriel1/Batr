// A small localStorage-backed store. There is no backend in this demo:
// every action (publish an offer, save, message, accept, counter, decline)
// mutates state in memory and is written straight back to localStorage,
// so the experience survives a refresh. Swap this module for real API
// calls when the service layer is ready.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  AUTO_REPLIES,
  CURRENT_USER_ID,
  REPLY_DELAY_MS,
  members as seedMembers,
  offers as seedOffers,
  threads as seedThreads,
} from "./data";
import type { Member, Message, Offer, Revision, Thread } from "./types";

const STORAGE_KEY = "batr.store.v1";

export interface StoreState {
  currentUserId: string;
  signedIn: boolean;
  members: Member[];
  offers: Offer[];
  threads: Thread[];
  savedIds: string[];
  likedIds: string[];
}

function seedState(): StoreState {
  // Deep-copy the seed so the module-level arrays stay pristine.
  return {
    currentUserId: CURRENT_USER_ID,
    signedIn: true,
    members: seedMembers.map((m) => ({ ...m })),
    offers: seedOffers.map((o) => ({ ...o, photos: [...o.photos], handover: [...o.handover] })),
    threads: seedThreads.map((t) => ({
      ...t,
      revisions: t.revisions.map((r) => ({ ...r })),
      messages: t.messages.map((m) => ({ ...m })),
    })),
    savedIds: ["braids", "guitar"],
    likedIds: ["canon-ae1"],
  };
}

function loadState(): StoreState {
  if (typeof window === "undefined") return seedState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw) as Partial<StoreState>;
    if (!parsed || !Array.isArray(parsed.offers) || !Array.isArray(parsed.threads)) {
      return seedState();
    }
    return {
      currentUserId: parsed.currentUserId ?? CURRENT_USER_ID,
      signedIn: parsed.signedIn ?? true,
      members: parsed.members?.length ? parsed.members : seedMembers,
      offers: parsed.offers,
      threads: parsed.threads,
      savedIds: parsed.savedIds ?? [],
      likedIds: parsed.likedIds ?? [],
    };
  } catch {
    return seedState();
  }
}

/** The shape the create-offer form submits. */
export type NewOfferInput = Omit<Offer, "id" | "ownerId" | "createdAt" | "status"> & {
  status?: Offer["status"];
};

/** A proposal made against an offer. */
export interface ProposalInput {
  ownerGives: string;
  otherGives: string;
  cash?: number;
  note?: string;
}

export interface StoreValue extends StoreState {
  currentUser: Member;
  /** Offers belonging to anyone other than the signed-in member. */
  publicOffers: Offer[];
  /** Offers belonging to the signed-in member. */
  myOffers: Offer[];
  savedOffers: Offer[];
  unreadCount: number;
  getOffer: (id: string) => Offer | undefined;
  getMember: (id: string) => Member | undefined;
  getThread: (id: string) => Thread | undefined;
  offersByOwner: (ownerId: string) => Offer[];
  isSaved: (offerId: string) => boolean;
  isLiked: (offerId: string) => boolean;
  addOffer: (input: NewOfferInput) => Offer;
  toggleSaved: (offerId: string) => void;
  toggleLiked: (offerId: string) => void;
  startThread: (offerId: string, proposal: ProposalInput) => Thread;
  sendMessage: (threadId: string, text: string) => void;
  acceptProposal: (threadId: string) => void;
  counterProposal: (threadId: string, proposal: ProposalInput) => void;
  declineProposal: (threadId: string) => void;
  withdrawProposal: (threadId: string) => void;
  markThreadRead: (threadId: string) => void;
  signIn: (input?: { name?: string; area?: string }) => void;
  signOut: () => void;
  resetDemo: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

let idCounter = 0;
function uid(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}${idCounter.toString(36)}`;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(() => loadState());
  const timers = useRef<Map<string, number>>(new Map());

  // Persist on every change so a refresh picks up exactly where you left off.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable — the demo still works in memory */
    }
  }, [state]);

  // Clear any pending auto-reply timers on unmount.
  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((handle) => window.clearTimeout(handle));
      map.clear();
    };
  }, []);

  const getOffer = useCallback((id: string) => state.offers.find((o) => o.id === id), [state.offers]);
  const getMember = useCallback((id: string) => state.members.find((m) => m.id === id), [state.members]);
  const getThread = useCallback((id: string) => state.threads.find((t) => t.id === id), [state.threads]);

  const offersByOwner = useCallback(
    (ownerId: string) => state.offers.filter((o) => o.ownerId === ownerId),
    [state.offers],
  );

  const isSaved = useCallback((offerId: string) => state.savedIds.includes(offerId), [state.savedIds]);
  const isLiked = useCallback((offerId: string) => state.likedIds.includes(offerId), [state.likedIds]);

  const addOffer = useCallback((input: NewOfferInput): Offer => {
    const offer: Offer = {
      ...input,
      id: uid("offer"),
      ownerId: CURRENT_USER_ID,
      createdAt: new Date().toISOString(),
      status: input.status ?? "active",
    };
    setState((prev) => ({ ...prev, offers: [offer, ...prev.offers] }));
    return offer;
  }, []);

  const toggleSaved = useCallback((offerId: string) => {
    setState((prev) => ({
      ...prev,
      savedIds: prev.savedIds.includes(offerId)
        ? prev.savedIds.filter((id) => id !== offerId)
        : [offerId, ...prev.savedIds],
    }));
  }, []);

  /** A quick "I like this" signal, separate from saving. */
  const toggleLiked = useCallback((offerId: string) => {
    setState((prev) => ({
      ...prev,
      likedIds: prev.likedIds.includes(offerId)
        ? prev.likedIds.filter((id) => id !== offerId)
        : [offerId, ...prev.likedIds],
    }));
  }, []);

  /** A counterpart answers on its own so the thread keeps moving. */
  const scheduleAutoReply = useCallback(
    (threadId: string) => {
      if (timers.current.has(threadId)) return;
      const handle = window.setTimeout(() => {
        timers.current.delete(threadId);
        setState((prev) => {
          const thread = prev.threads.find((t) => t.id === threadId);
          if (!thread || thread.status === "agreed" || thread.status === "closed") return prev;
          const text = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)] ?? AUTO_REPLIES[0];
          const message: Message = {
            id: uid("msg"),
            authorId: thread.counterpartId,
            text,
            createdAt: new Date().toISOString(),
          };
          return {
            ...prev,
            threads: prev.threads.map((t) =>
              t.id === threadId
                ? {
                    ...t,
                    messages: [...t.messages, message],
                    status: t.incoming ? "your_turn" : "waiting",
                    unread: t.incoming ? t.unread + 1 : t.unread,
                  }
                : t,
            ),
          };
        });
      }, REPLY_DELAY_MS);
      timers.current.set(threadId, handle);
    },
    [],
  );

  const appendMessage = useCallback((threadId: string, message: Message) => {
    setState((prev) => ({
      ...prev,
      threads: prev.threads.map((t) =>
        t.id === threadId ? { ...t, messages: [...t.messages, message] } : t,
      ),
    }));
  }, []);

  const startThread = useCallback(
    (offerId: string, proposal: ProposalInput): Thread => {
      const offer = state.offers.find((o) => o.id === offerId);
      const thread: Thread = {
        id: uid("thread"),
        offerId,
        counterpartId: offer?.ownerId ?? "",
        incoming: false,
        status: "waiting",
        revisions: [
          {
            n: 1,
            authorId: CURRENT_USER_ID,
            createdAt: new Date().toISOString(),
            ownerGives: proposal.ownerGives,
            otherGives: proposal.otherGives,
            cash: proposal.cash,
            note: proposal.note,
          },
        ],
        messages: proposal.note
          ? [
              {
                id: uid("msg"),
                authorId: CURRENT_USER_ID,
                text: proposal.note,
                createdAt: new Date().toISOString(),
              },
            ]
          : [],
        unread: 0,
      };
      setState((prev) => ({ ...prev, threads: [thread, ...prev.threads] }));
      scheduleAutoReply(thread.id);
      return thread;
    },
    [state.offers, scheduleAutoReply],
  );

  const sendMessage = useCallback(
    (threadId: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      appendMessage(threadId, {
        id: uid("msg"),
        authorId: CURRENT_USER_ID,
        text: trimmed,
        createdAt: new Date().toISOString(),
      });
      scheduleAutoReply(threadId);
    },
    [appendMessage, scheduleAutoReply],
  );

  const acceptProposal = useCallback((threadId: string) => {
    setState((prev) => ({
      ...prev,
      threads: prev.threads.map((t) =>
        t.id === threadId
          ? {
              ...t,
              status: "agreed",
              unread: 0,
              messages: [
                ...t.messages,
                {
                  id: uid("msg"),
                  authorId: CURRENT_USER_ID,
                  text: "Accepted — let's arrange the handover.",
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : t,
      ),
    }));
  }, []);

  const counterProposal = useCallback((threadId: string, proposal: ProposalInput) => {
    setState((prev) => ({
      ...prev,
      threads: prev.threads.map((t) => {
        if (t.id !== threadId) return t;
        const n = t.revisions.length + 1;
        const revision: Revision = {
          n,
          authorId: CURRENT_USER_ID,
          createdAt: new Date().toISOString(),
          ownerGives: proposal.ownerGives,
          otherGives: proposal.otherGives,
          cash: proposal.cash,
          note: proposal.note,
        };
        const messages = proposal.note
          ? [
              ...t.messages,
              {
                id: uid("msg"),
                authorId: CURRENT_USER_ID,
                text: proposal.note,
                createdAt: new Date().toISOString(),
              },
            ]
          : t.messages;
        return { ...t, revisions: [...t.revisions, revision], messages, status: "waiting", unread: 0 };
      }),
    }));
  }, []);

  const declineProposal = useCallback((threadId: string) => {
    setState((prev) => ({
      ...prev,
      threads: prev.threads.map((t) =>
        t.id === threadId ? { ...t, status: "closed", outcome: "declined", unread: 0 } : t,
      ),
    }));
  }, []);

  const withdrawProposal = useCallback((threadId: string) => {
    setState((prev) => ({
      ...prev,
      threads: prev.threads.map((t) =>
        t.id === threadId ? { ...t, status: "closed", outcome: "withdrawn", unread: 0 } : t,
      ),
    }));
  }, []);

  const markThreadRead = useCallback((threadId: string) => {
    setState((prev) => ({
      ...prev,
      threads: prev.threads.map((t) => (t.id === threadId && t.unread ? { ...t, unread: 0 } : t)),
    }));
  }, []);

  const resetDemo = useCallback(() => {
    timers.current.forEach((handle) => window.clearTimeout(handle));
    timers.current.clear();
    setState(seedState());
  }, []);

  const signIn = useCallback((input?: { name?: string; area?: string }) => {
    setState((prev) => ({
      ...prev,
      signedIn: true,
      members: prev.members.map((m) =>
        m.id === prev.currentUserId
          ? {
              ...m,
              name: input?.name?.trim() ? input.name.trim() : m.name,
              area: input?.area ?? m.area,
            }
          : m,
      ),
    }));
  }, []);

  const signOut = useCallback(() => {
    setState((prev) => ({ ...prev, signedIn: false }));
  }, []);

  const value = useMemo<StoreValue>(() => {
    const publicOffers = state.offers.filter((o) => o.ownerId !== state.currentUserId);
    const myOffers = state.offers.filter((o) => o.ownerId === state.currentUserId);
    const savedOffers = state.savedIds
      .map((id) => state.offers.find((o) => o.id === id))
      .filter((o): o is Offer => Boolean(o));
    const currentUser =
      state.members.find((m) => m.id === state.currentUserId) ?? seedMembers[0]!;
    const unreadCount = state.threads.reduce((total, t) => total + t.unread, 0);
    return {
      ...state,
      currentUser,
      publicOffers,
      myOffers,
      savedOffers,
      unreadCount,
      getOffer,
      getMember,
      getThread,
      offersByOwner,
      isSaved,
      isLiked,
      addOffer,
      toggleSaved,
      toggleLiked,
      startThread,
      sendMessage,
      acceptProposal,
      counterProposal,
      declineProposal,
      withdrawProposal,
      markThreadRead,
      signIn,
      signOut,
      resetDemo,
    };
  }, [
    state,
    getOffer,
    getMember,
    getThread,
    offersByOwner,
    isSaved,
    isLiked,
    addOffer,
    toggleSaved,
    toggleLiked,
    startThread,
    sendMessage,
    acceptProposal,
    counterProposal,
    declineProposal,
    withdrawProposal,
    markThreadRead,
    signIn,
    signOut,
    resetDemo,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used inside a StoreProvider");
  return value;
}
