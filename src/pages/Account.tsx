import { Link, useNavigate } from "react-router-dom";
import { LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import { useStore } from "../lib/store";
import { Avatar } from "../components/ui/Avatar";
import { Button, buttonClass } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { Rating } from "../components/ui/Rating";

export function Account() {
  const { currentUser, myOffers, threads, savedOffers, resetDemo, signOut } = useStore();
  const navigate = useNavigate();

  const stats = [
    { label: "Offers posted", value: myOffers.length },
    { label: "Exchanges", value: threads.length },
    { label: "Saved", value: savedOffers.length },
    { label: "Trades", value: currentUser.trades },
  ];

  return (
    <Container className="py-8 sm:py-10">
      <header className="max-w-2xl">
        <h1 className="font-display text-h1 text-text-primary">Account</h1>
        <p className="mt-3 text-body text-text-secondary">
          Your profile, activity and settings for this browser.
        </p>
      </header>

      <section className="mt-8 flex flex-col gap-5 rounded-xl border border-border-default bg-bg-surface p-5 shadow-card sm:flex-row sm:items-center sm:p-6">
        <Avatar name={currentUser.name} size="lg" />
        <div className="min-w-0">
          <h2 className="text-h3 text-text-primary">{currentUser.name}</h2>
          <p className="text-body-sm text-text-muted">
            {currentUser.area}, Ibadan · Member since {currentUser.since}
          </p>
        </div>
        <div className="sm:ml-auto sm:text-right">
          <Rating value={currentUser.rating} className="text-body text-text-primary" />
          <p className="text-caption text-text-muted tnum">{currentUser.trades} trades</p>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border-default bg-bg-surface p-4"
          >
            <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">
              {stat.label}
            </p>
            <p className="mt-1 font-display text-h2 text-text-primary tnum">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-border-default bg-bg-surface p-5">
          <h2 className="text-h4 text-text-primary">How your data works here</h2>
          <p className="mt-2 text-body-sm text-text-secondary">
            This is a working demonstration. Your offers, saved items and messages are stored in this
            browser only — nothing is sent to a server, and clearing your browser data removes it.
          </p>
          <p className="mt-3 inline-flex items-center gap-2 text-body-sm font-semibold text-state-success">
            <ShieldCheck className="h-4 w-4" />
            Private to this device
          </p>
        </section>

        <section className="rounded-xl border border-border-default bg-bg-surface p-5">
          <h2 className="text-h4 text-text-primary">Reset the demo</h2>
          <p className="mt-2 text-body-sm text-text-secondary">
            Clear everything you have added and return to the starting offers, exchanges and saved
            items.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={resetDemo}>
              <RefreshCw className="h-4 w-4" />
              Reset demo data
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                signOut();
                navigate("/sign-in");
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
            <Link to="/rules" className={buttonClass({ variant: "ghost" })}>
              Read the community rules
            </Link>
          </div>
        </section>
      </div>
    </Container>
  );
}
