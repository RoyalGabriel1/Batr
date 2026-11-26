import { Link, NavLink } from "react-router-dom";
import {
  ArrowLeftRight,
  Bookmark,
  Compass,
  LayoutGrid,
  Plus,
  User,
} from "lucide-react";
import { initials } from "../lib/format";
import { useStore } from "../lib/store";
import { Container } from "./ui/Container";

const NAV = [
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/exchanges", label: "Exchanges", icon: ArrowLeftRight },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/my-offers", label: "My offers", icon: LayoutGrid },
];

export function SiteHeader() {
  const { currentUser, unreadCount, signedIn } = useStore();

  return (
    <header className="sticky top-0 z-40 border-b border-border-default bg-bg-surface/95 backdrop-blur">
      <Container className="flex h-16 items-center gap-2 sm:gap-6">
        <Link to="/" className="shrink-0" aria-label="BATR home">
          <img src="/brand/logo-horizontal-ink.png" alt="BATR" className="h-8 w-auto" />
        </Link>

        <nav
          className="flex flex-1 items-center justify-center gap-1 sm:justify-start md:gap-2"
          aria-label="Main"
        >
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              aria-label={item.label}
              className={({ isActive }) =>
                [
                  "relative flex h-16 items-center gap-2 px-2 text-body-sm font-medium transition-colors md:px-3",
                  isActive ? "text-text-primary" : "text-text-secondary hover:text-text-primary",
                ].join(" ")
              }
            >
              <item.icon className="size-5 md:hidden" aria-hidden="true" />
              <span className="hidden md:inline">{item.label}</span>
              {item.to === "/exchanges" && unreadCount > 0 ? (
                <span className="absolute right-0 top-3 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-primary px-1 text-[10px] font-semibold text-text-on-accent md:static md:h-5 md:min-w-5">
                  {unreadCount}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        <Link
          to="/offers/new"
          className="hidden h-10 items-center gap-2 rounded-full bg-accent-primary px-4 text-body-sm font-semibold text-text-on-accent transition hover:bg-accent-primary-hover sm:inline-flex"
        >
          <Plus className="size-4" aria-hidden="true" />
          Create offer
        </Link>

        <Link
          to={signedIn ? "/account" : "/sign-in"}
          aria-label={signedIn ? "Account" : "Sign in"}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-primary text-body-sm font-semibold text-text-on-accent transition hover:bg-accent-primary-hover"
        >
          {signedIn ? (
            initials(currentUser.name).charAt(0)
          ) : (
            <User className="size-4" aria-hidden="true" />
          )}
        </Link>
      </Container>
    </header>
  );
}
