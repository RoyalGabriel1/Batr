import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, ShieldCheck } from "lucide-react";
import { AREAS } from "../lib/constants";
import { useStore } from "../lib/store";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { ExchangeGlyph } from "../components/ui/ExchangePair";

const inputClass =
  "w-full rounded-md border border-border-default bg-bg-surface px-3 py-2.5 text-body-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary";

const SELLING = [
  "Swap products, services and skills with people nearby",
  "Negotiate openly — every revision is kept",
  "Add a cash top-up when the values don’t quite match",
];

export function SignIn() {
  const { currentUser, signIn } = useStore();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"signin" | "create">("signin");
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState("tolu@batr.demo");
  const [password, setPassword] = useState("");
  const [area, setArea] = useState<string>(currentUser.area);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!name.trim()) {
      setError("Please tell us your name.");
      return;
    }
    if (password.length < 4) {
      setError("Enter a password of at least 4 characters (anything works — this is a demo).");
      return;
    }
    signIn({ name: name.trim(), area });
    navigate("/explore");
  };

  return (
    <Container className="py-10 sm:py-16">
      <div className="grid overflow-hidden rounded-xl border border-border-default bg-bg-surface shadow-card lg:grid-cols-2">
        {/* Brand panel */}
        <aside className="hidden flex-col justify-between bg-bg-inverse p-8 lg:flex">
          <div>
            <img src="/brand/logo-horizontal-inverse.png" alt="BATR" className="h-6 w-auto" />
            <h2 className="mt-8 font-display text-h2 text-text-on-inverse">
              Trade what you have for what you need.
            </h2>
            <p className="mt-3 text-body-sm text-text-on-inverse-muted">
              BATR is the peer-to-peer exchange marketplace for products, services and skills — live
              in Ibadan.
            </p>
          </div>

          <ul className="mt-10 space-y-3">
            {SELLING.map((line) => (
              <li key={line} className="flex items-start gap-3 text-body-sm text-text-on-inverse-muted">
                <ExchangeGlyph className="mt-0.5 h-6 w-6 bg-white/10 text-accent-on-inverse" />
                {line}
              </li>
            ))}
          </ul>

          <p className="mt-10 inline-flex items-center gap-2 text-caption text-text-on-inverse-muted">
            <ShieldCheck className="h-4 w-4 text-accent-on-inverse" />
            Proposals and agreements stay private to their two parties.
          </p>
        </aside>

        {/* Form panel */}
        <div className="p-6 sm:p-8">
          <div className="lg:hidden">
            <Link to="/" className="inline-flex items-center" aria-label="BATR home">
              <img src="/brand/logo-horizontal-ink.png" alt="BATR" className="h-6 w-auto" />
            </Link>
          </div>

          <h1 className="mt-4 font-display text-h2 text-text-primary lg:mt-0">
            {mode === "signin" ? "Sign in" : "Create an account"}
          </h1>
          <p className="mt-2 text-body-sm text-text-secondary">
            {mode === "signin"
              ? "Welcome back. Pick up your offers and exchanges."
              : "Join BATR and post your first offer in a minute."}
          </p>

          <div className="mt-6 inline-flex rounded-lg border border-border-default bg-bg-base p-1">
            {(
              [
                { id: "signin", label: "Sign in" },
                { id: "create", label: "Create account" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setMode(tab.id);
                  setError(null);
                }}
                aria-pressed={mode === tab.id}
                className={[
                  "rounded-md px-4 py-1.5 text-body-sm font-semibold transition-colors",
                  mode === tab.id
                    ? "bg-accent-primary text-text-on-accent"
                    : "text-text-secondary hover:text-text-primary",
                ].join(" ")}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <label className="block">
              <span className="text-body-sm font-semibold text-text-primary">Your name</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Tolu A."
                className={[inputClass, "mt-1.5"].join(" ")}
              />
            </label>

            <label className="block">
              <span className="text-body-sm font-semibold text-text-primary">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className={[inputClass, "mt-1.5"].join(" ")}
              />
            </label>

            <label className="block">
              <span className="text-body-sm font-semibold text-text-primary">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className={[inputClass, "mt-1.5"].join(" ")}
              />
            </label>

            {mode === "create" ? (
              <label className="block">
                <span className="text-body-sm font-semibold text-text-primary">Your area</span>
                <select
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                  className={[inputClass, "mt-1.5"].join(" ")}
                >
                  {AREAS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {error ? (
              <p className="rounded-md bg-state-danger-soft px-3 py-2 text-body-sm text-state-danger">
                {error}
              </p>
            ) : null}

            <Button type="submit" size="lg" className="w-full">
              {mode === "signin" ? "Sign in" : "Create account"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-4 inline-flex items-center gap-2 text-caption text-text-muted">
            <Lock className="h-3.5 w-3.5" />
            This is a demo — no password is sent anywhere. Your details stay in this browser.
          </p>

          <p className="mt-6 border-t border-border-default pt-4 text-body-sm text-text-secondary">
            Just looking?{" "}
            <Link to="/explore" className="font-semibold text-accent-primary hover:text-accent-primary-hover">
              Browse offers without signing in
            </Link>
            .
          </p>
        </div>
      </div>
    </Container>
  );
}
