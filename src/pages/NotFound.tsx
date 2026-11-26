import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { buttonClass } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { EmptyState } from "../components/ui/EmptyState";

export function NotFound() {
  return (
    <Container className="py-20">
      <EmptyState
        icon={<Compass className="h-5 w-5" />}
        title="Page not found"
        body="The page you're looking for has moved or never existed. Explore the offers instead."
        action={
          <Link to="/explore" className={buttonClass()}>
            Explore offers
          </Link>
        }
      />
    </Container>
  );
}
