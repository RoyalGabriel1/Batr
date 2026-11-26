import { Outlet } from "react-router-dom";
import { DemoBanner } from "./DemoBanner";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col bg-bg-base">
      <DemoBanner />
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
