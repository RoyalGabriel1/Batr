import { RotateCcw, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "../lib/store";
import { Container } from "./ui/Container";

/** The site-wide demo strip the preview shows above the header. */
export function DemoBanner() {
  const { currentUser, signedIn, resetDemo } = useStore();

  return (
    <div className="bg-bg-inverse text-text-on-inverse">
      <Container className="flex items-center gap-3 py-2 text-caption">
        <Sparkles className="size-3.5 shrink-0 text-accent-on-inverse" aria-hidden="true" />
        <p className="min-w-0 truncate">
          <span className="font-semibold">Live demo</span>
          <span className="text-text-on-inverse-muted">
            {" · "}
            {signedIn ? (
              <>You’re signed in as {currentUser.name}. Other members reply in real time.</>
            ) : (
              <>
                <Link to="/sign-in" className="font-semibold underline underline-offset-2">
                  Sign in
                </Link>{" "}
                to try BATR. Other members reply in real time.
              </>
            )}
          </span>
        </p>
        <button
          type="button"
          onClick={resetDemo}
          className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 font-medium text-accent-on-inverse transition hover:bg-text-on-inverse/10"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Reset demo
        </button>
      </Container>
    </div>
  );
}
