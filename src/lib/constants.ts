import type {
  Condition,
  ExchangeMode,
  HandoverMethod,
  OfferCategory,
  OfferType,
} from "./types";

export const PRODUCT_NAME = "BATR";
export const CITY = "Ibadan";

/** Categories, newest direction (the live preview shows 11). */
export const CATEGORIES: Record<OfferCategory, string> = {
  electronics: "Electronics",
  clothing_accessories: "Clothing and accessories",
  home_garden: "Home and garden",
  books_media: "Books and media",
  sports_outdoors: "Sports and outdoors",
  music: "Music",
  tools: "Tools",
  lessons_tutoring: "Lessons and tutoring",
  beauty_hair: "Beauty and hair",
  repairs: "Repairs",
  design_digital: "Design and digital",
};

export const CATEGORY_IDS = Object.keys(CATEGORIES) as OfferCategory[];

/** The six categories shown as chips in the home hero. */
export const HERO_CATEGORIES: OfferCategory[] = [
  "electronics",
  "beauty_hair",
  "music",
  "repairs",
  "home_garden",
  "lessons_tutoring",
];

export const OFFER_TYPES: Record<OfferType, string> = {
  item: "Item",
  service: "Service",
};

export const CONDITIONS: Record<Condition, string> = {
  new: "New",
  like_new: "Like new",
  good: "Good",
  fair: "Fair",
};

export const CONDITION_IDS = Object.keys(CONDITIONS) as Condition[];

export const EXCHANGE_MODES: Record<ExchangeMode, string> = {
  swap: "Swap",
  swap_cash: "Swap, or swap plus cash",
};

export const HANDOVER_METHODS: Record<HandoverMethod, string> = {
  collection: "Collection",
  public_place: "Meet in a public place",
  delivery: "Delivery",
};

export const HANDOVER_IDS = Object.keys(HANDOVER_METHODS) as HandoverMethod[];

export const AREAS = [
  "Agodi",
  "Akobo",
  "Bodija",
  "Challenge",
  "Dugbe",
  "Jericho",
  "Mokola",
  "Oluyole",
  "Ring Road",
  "Samonda",
  "University of Ibadan",
] as const;

export const AUTO_REPLY_AFTER_MS = 2200;

/** The platform fee: 3% of the exchange value, shared 50/50. */
export const FEE_RATE = 0.03;
