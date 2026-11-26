import { Container } from "./ui/Container";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border-default bg-bg-surface">
      <Container className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center">
        <img
          src="/brand/logo-horizontal-ink.png"
          alt="BATR"
          className="h-7 w-auto self-start"
          loading="lazy"
        />
        <p className="text-body-sm text-text-muted sm:ml-6">
          The peer-to-peer exchange marketplace for products, services and skills. Trade what you
          have, add cash when it helps.
        </p>
        <p className="text-caption text-text-muted sm:ml-auto sm:shrink-0">
          © {new Date().getFullYear()} BATR · Ibadan, Nigeria
        </p>
      </Container>
    </footer>
  );
}
