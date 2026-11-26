import { FEE_RATE } from "./constants";

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

/** ₦135,000 */
export function formatNaira(amount: number): string {
  return naira.format(amount).replace("NGN", "₦");
}

/** The 3% platform fee, quoted in whole naira. */
export function platformFee(value: number): number {
  return Math.round(value * FEE_RATE);
}

/** Two up to 1 decimal, e.g. 4.8. */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/** First letter(s) of a display name, for the neutral member circle. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/** "2h ago", "yesterday", "3 days ago", falling back to a date. */
export function postedAge(iso: string, now: number = Date.now()): string {
  const then = new Date(iso).getTime();
  const minutes = Math.max(0, Math.round((now - then) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** A compact clock label for message timestamps. */
export function clockTime(iso: string, now: number = Date.now()): string {
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  return postedAge(iso, now);
}

/** A stable slug from a title, used as an offer id. */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
