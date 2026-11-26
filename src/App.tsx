import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ScrollToTop } from "./components/ScrollToTop";
import { Home } from "./pages/Home";
import { Explore } from "./pages/Explore";
import { OfferDetail } from "./pages/OfferDetail";
import { CreateOffer } from "./pages/CreateOffer";
import { Exchanges } from "./pages/Exchanges";
import { SignIn } from "./pages/SignIn";
import { Thread } from "./pages/Thread";
import { MyOffers } from "./pages/MyOffers";
import { Saved } from "./pages/Saved";
import { Account } from "./pages/Account";
import { Rules } from "./pages/Rules";
import { NotFound } from "./pages/NotFound";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="explore" element={<Explore />} />
          <Route path="offers/new" element={<CreateOffer />} />
          <Route path="offers/:id" element={<OfferDetail />} />
          <Route path="exchanges" element={<Exchanges />} />
          <Route path="exchanges/:id" element={<Thread />} />
          <Route path="my-offers" element={<MyOffers />} />
          <Route path="saved" element={<Saved />} />
          <Route path="account" element={<Account />} />
          <Route path="sign-in" element={<SignIn />} />
          <Route path="rules" element={<Rules />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
