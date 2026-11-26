// Domain types for the BATR demo. The product language is the same as
// the handoff: offer, proposal, revision, counteroffer, agreement,
// handover. Never "order", "cart", "product", "buyer" or "seller".

export type OfferCategory =
  | "electronics"
  | "clothing_accessories"
  | "home_garden"
  | "books_media"
  | "sports_outdoors"
  | "music"
  | "tools"
  | "lessons_tutoring"
  | "beauty_hair"
  | "repairs"
  | "design_digital";

export type OfferType = "item" | "service";

export type Condition = "new" | "like_new" | "good" | "fair";

export type ExchangeMode = "swap" | "swap_cash";

export type HandoverMethod = "collection" | "public_place" | "delivery";

export type OfferStatus = "active" | "paused" | "closed";

export interface Member {
  id: string;
  name: string;
  area: string;
  /** e.g. "Jul 2026" */
  since: string;
  rating: number;
  trades: number;
}

export interface Offer {
  id: string;
  title: string;
  type: OfferType;
  category: OfferCategory;
  condition?: Condition;
  /** The short version members see on the card. */
  offering: string;
  /** What you'd like in return. */
  wants: string;
  description: string;
  area: string;
  exchange: ExchangeMode;
  handover: HandoverMethod[];
  /** Your estimate of its value, in naira. */
  estimate?: number;
  photos: string[];
  ownerId: string;
  /** ISO timestamp. */
  createdAt: string;
  status: OfferStatus;
}

/** A revision of a proposal. Forward-only; acceptance names one exactly. */
export interface Revision {
  n: number;
  authorId: string;
  createdAt: string;
  /** What the offer's owner gives in this revision. */
  ownerGives: string;
  /** What the other member gives in this revision. */
  otherGives: string;
  /** Cash top-up, in naira, paid by the other member to the owner. */
  cash?: number;
  note?: string;
}

export type ThreadStatus = "your_turn" | "waiting" | "agreed" | "closed";

export type ThreadOutcome = "declined" | "withdrawn" | "cancelled" | "completed";

export interface Message {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface Thread {
  id: string;
  offerId: string;
  counterpartId: string;
  /** true when the other member proposed against your offer. */
  incoming: boolean;
  status: ThreadStatus;
  outcome?: ThreadOutcome;
  revisions: Revision[];
  messages: Message[];
  unread: number;
}
