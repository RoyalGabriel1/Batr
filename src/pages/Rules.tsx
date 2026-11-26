import { Link } from "react-router-dom";
import { Handshake, HeartHandshake, ListChecks, MapPin, Scale, ShieldCheck } from "lucide-react";
import { buttonClass } from "../components/ui/Button";
import { Container } from "../components/ui/Container";

const STEPS = [
  {
    title: "Offer something real",
    body: "Post an item or a skill you actually have, with a photo of the real thing and an honest description.",
  },
  {
    title: "Say what you'd take",
    body: "List what you'd like in return. It is an opening position, not a fixed price.",
  },
  {
    title: "Propose and revise",
    body: "Both sides propose, counter and revise until the terms are fair to each of you.",
  },
  {
    title: "Agree and hand over",
    body: "Accept the terms you want. The exact address is shared only once you have agreed.",
  },
];

const RULES = [
  "Photograph the actual item, never stock imagery or someone else's photos.",
  "Describe condition honestly — mention marks, faults and anything missing.",
  "Meet in a public place, or agree a handover you are both comfortable with.",
  "Keep negotiation inside BATR with proposals and revisions, not off-platform.",
  "Treat the other member the way you would want to be treated.",
];

const PROMISES = [
  {
    icon: Scale,
    title: "Fair for both sides",
    body: "Every exchange names both sides — what you give and what you get. Nothing is one-sided.",
  },
  {
    icon: ShieldCheck,
    title: "A 3% fee, shared equally",
    body: "BATR charges 3% of the exchange value, split 50/50 between members. No listing fees.",
  },
  {
    icon: MapPin,
    title: "Location stays general",
    body: "Only your area is shown publicly. Exact addresses are shared inside an agreement.",
  },
];

export function Rules() {
  return (
    <Container className="py-8 sm:py-10">
      <header className="max-w-2xl">
        <h1 className="font-display text-h1 text-text-primary">How BATR works</h1>
        <p className="mt-3 text-body text-text-secondary">
          BATR is a peer-to-peer exchange marketplace. You trade what you have for what you need —
          no cash required, though a small top-up is fine when it balances things out.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="font-display text-h2 text-text-primary">From “I have this” to “done deal”</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="rounded-xl border border-border-default bg-bg-surface p-5 shadow-card"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-body-sm font-bold text-accent-primary tnum">
                {index + 1}
              </span>
              <h3 className="mt-3 text-h4 text-text-primary">{step.title}</h3>
              <p className="mt-1 text-body-sm text-text-secondary">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12 grid gap-5 lg:grid-cols-3">
        {PROMISES.map((promise) => (
          <div
            key={promise.title}
            className="rounded-xl border border-border-default bg-bg-surface p-5"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent-primary">
              <promise.icon className="h-5 w-5" />
            </span>
            <h2 className="mt-3 text-h4 text-text-primary">{promise.title}</h2>
            <p className="mt-1 text-body-sm text-text-secondary">{promise.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-12 rounded-xl border border-border-default bg-bg-surface p-6">
        <h2 className="inline-flex items-center gap-2 font-display text-h2 text-text-primary">
          <ListChecks className="h-6 w-6 text-accent-primary" />
          What we ask of members
        </h2>
        <ul className="mt-5 space-y-3">
          {RULES.map((rule) => (
            <li key={rule} className="flex items-start gap-3 text-body-sm text-text-secondary">
              <HeartHandshake className="mt-0.5 h-4 w-4 shrink-0 text-accent-primary" />
              {rule}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 flex flex-col items-start gap-4 rounded-xl border border-border-default bg-bg-inverse p-6 sm:flex-row sm:items-center">
        <Handshake className="h-8 w-8 text-accent-on-inverse" />
        <div>
          <h2 className="text-h4 text-text-on-inverse">Ready to trade?</h2>
          <p className="mt-1 text-body-sm text-text-on-inverse-muted">
            Post what you have and see what comes back.
          </p>
        </div>
        <Link to="/offers/new" className={buttonClass({ size: "lg", className: "sm:ml-auto" })}>
          Create an offer
        </Link>
      </section>
    </Container>
  );
}
