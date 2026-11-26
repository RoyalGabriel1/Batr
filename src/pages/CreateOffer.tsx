import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ImagePlus, Sparkles } from "lucide-react";
import {
  AREAS,
  CATEGORIES,
  CATEGORY_IDS,
  CONDITIONS,
  CONDITION_IDS,
  HANDOVER_IDS,
  HANDOVER_METHODS,
} from "../lib/constants";
import type { Condition, HandoverMethod, OfferCategory, Offer, OfferType } from "../lib/types";
import { useStore } from "../lib/store";
import { Container } from "../components/ui/Container";
import { OfferCard } from "../components/ui/OfferCard";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

const SAMPLE = {
  type: "item" as OfferType,
  title: "Canon AE-1 35mm film camera",
  category: "electronics" as OfferCategory,
  condition: "good" as Condition,
  offering: "Canon AE-1 Program with a 50mm f/1.8 lens and strap.",
  wants: "A bicycle, phone repair, or cash",
  description:
    "Classic 35mm film camera in good working order. Shutter fires at all speeds, meter is accurate. Comes with the lens, a strap and a roll of film.",
  area: "Bodija",
  estimate: "80000",
  handover: ["collection", "public_place"] as HandoverMethod[],
  photo: "/img/canon.jpg",
  photoAlt: "A black 35mm film camera on a wooden table",
};

const inputClass =
  "h-9 w-full min-w-0 rounded-md border border-border-strong bg-transparent px-3 py-1 text-sm text-text-primary shadow-xs outline-none transition-colors placeholder:text-text-muted focus:border-accent-primary";
const selectClass =
  "h-10 w-full appearance-none rounded-md border border-border-strong bg-transparent pl-3 pr-9 py-2 text-sm text-text-primary shadow-xs outline-none transition-colors focus:border-accent-primary";
const textareaClass =
  "min-h-16 w-full resize-y rounded-md border border-border-strong bg-transparent px-3 py-2 text-sm text-text-primary shadow-xs outline-none transition-colors placeholder:text-text-muted focus:border-accent-primary";

type FieldKey = "photo" | "title" | "offering" | "wants" | "handover";

export function CreateOffer() {
  const navigate = useNavigate();
  const { addOffer, currentUser } = useStore();

  const [type, setType] = useState<OfferType>("item");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<OfferCategory>("electronics");
  const [condition, setCondition] = useState<Condition>("like_new");
  const [offering, setOffering] = useState("");
  const [wants, setWants] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState<string>("Bodija");
  const [estimate, setEstimate] = useState("");
  const [handover, setHandover] = useState<HandoverMethod[]>(["public_place"]);
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [photoAlt, setPhotoAlt] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [toast, setToast] = useState<{ title: string; description: string } | null>(null);

  const toggleHandover = (method: HandoverMethod) => {
    setHandover((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method],
    );
  };

  const onPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setUploadError("Please choose a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setUploadError("That image is over 5MB. Please choose a smaller one.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(typeof reader.result === "string" ? reader.result : undefined);
      setUploadError(null);
    };
    reader.readAsDataURL(file);
  };

  const fillSample = () => {
    setType(SAMPLE.type);
    setTitle(SAMPLE.title);
    setCategory(SAMPLE.category);
    setCondition(SAMPLE.condition);
    setOffering(SAMPLE.offering);
    setWants(SAMPLE.wants);
    setDescription(SAMPLE.description);
    setArea(SAMPLE.area);
    setEstimate(SAMPLE.estimate);
    setHandover(SAMPLE.handover);
    setPhoto(SAMPLE.photo);
    setPhotoAlt(SAMPLE.photoAlt);
    setUploadError(null);
    setShowErrors(false);
  };

  const estimateNumber = estimate.trim() === "" ? undefined : Math.max(0, Math.round(Number(estimate) || 0));

  const previewOffer: Offer = useMemo(
    () => ({
      id: "preview",
      title: title.trim() || "Your offer title",
      type,
      category,
      condition: type === "item" ? condition : undefined,
      offering: offering.trim() || "What you’re offering",
      wants: wants.trim() || "What you’d like in return",
      description: description.trim(),
      area,
      exchange: "swap",
      handover,
      estimate: estimateNumber,
      photos: photo ? [photo] : [],
      ownerId: currentUser.id,
      createdAt: new Date().toISOString(),
      status: "active",
    }),
    [title, type, category, condition, offering, wants, description, area, handover, estimateNumber, photo, currentUser.id],
  );

  const validation: Record<FieldKey, string | undefined> = {
    photo: photo ? undefined : "Add at least one photo.",
    title: title.trim().length < 5 ? "Give it a title of at least 5 characters." : undefined,
    offering: offering.trim().length < 3 ? "Say what you’re offering." : undefined,
    wants: wants.trim().length < 3 ? "Say what you’d like in return." : undefined,
    handover: handover.length === 0 ? "Choose at least one way to hand over." : undefined,
  };
  const valid = !Object.values(validation).some(Boolean);
  const shown = (key: FieldKey) => (showErrors ? validation[key] : undefined);

  const publish = () => {
    setShowErrors(true);
    if (!valid) return;
    const offer = addOffer({
      title: title.trim(),
      type,
      category,
      condition: type === "item" ? condition : undefined,
      offering: offering.trim(),
      wants: wants.trim(),
      description: description.trim(),
      area,
      exchange: "swap",
      handover,
      estimate: estimateNumber,
      photos: photo ? [photo] : [],
    });
    setToast({
      title: "Your offer is live",
      description: "It now appears in Explore for members nearby.",
    });
    window.setTimeout(() => navigate(`/offers/${offer.id}`), 700);
  };

  return (
    <Container className="py-10 sm:py-14">
      <Link
        to="/my-offers"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        My offers
      </Link>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl text-text-primary sm:text-5xl">Create an offer</h1>
          <p className="mt-2 text-text-secondary">
            Show what you have, say what you’d take in return, and publish.
          </p>
        </div>
        <button
          type="button"
          onClick={fillSample}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border-default bg-bg-base px-4 text-sm font-medium text-text-primary shadow-xs transition-colors hover:bg-accent-soft hover:text-accent-primary-hover"
        >
          <Sparkles className="size-4" aria-hidden="true" />
          Fill with a sample
        </button>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <form
          className="flex flex-col gap-6 rounded-2xl bg-bg-surface p-5 shadow-card sm:p-8"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            publish();
          }}
        >
          <div
            className="inline-flex w-fit rounded-full bg-bg-subtle p-1"
            role="group"
            aria-label="What are you offering?"
          >
            {(["item", "service"] as OfferType[]).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={type === option}
                onClick={() => setType(option)}
                className={[
                  "h-9 rounded-full px-5 text-sm font-medium transition-colors",
                  type === option ? "bg-bg-surface shadow-sm" : "text-text-secondary",
                ].join(" ")}
              >
                {option === "item" ? "An item" : "A service or skill"}
              </button>
            ))}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-text-primary">Photo</label>
            <label
              className={[
                "relative flex aspect-[16/9] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed text-sm text-text-secondary transition hover:border-accent-primary",
                showErrors && validation.photo ? "border-state-danger" : "border-border-default",
              ].join(" ")}
            >
              {photo ? (
                <img src={photo} alt="" className="absolute inset-0 size-full object-cover" />
              ) : (
                <>
                  <ImagePlus className="size-8 text-accent-primary" aria-hidden="true" />
                  <span className="font-medium">Add a photo of the real thing</span>
                  <span className="text-xs text-text-muted">JPG, PNG or WebP</span>
                </>
              )}
              <input
                type="file"
                accept={ACCEPTED.join(",")}
                onChange={onPhoto}
                className="sr-only"
              />
            </label>
            {shown("photo") || uploadError ? (
              <p className="text-xs text-state-danger" role="alert">
                {shown("photo") ?? uploadError}
              </p>
            ) : null}
            <input
              type="text"
              aria-label="Photo description"
              placeholder="Describe the photo for screen readers"
              value={photoAlt}
              onChange={(event) => setPhotoAlt(event.target.value)}
              maxLength={200}
              className={inputClass}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="title" className="text-sm font-medium text-text-primary">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={80}
              placeholder={
                type === "item"
                  ? "e.g. Canon AE-1 35mm film camera"
                  : "e.g. Knotless braids, mid-back length"
              }
              className={inputClass}
            />
            {shown("title") ? (
              <p className="text-xs text-state-danger" role="alert">
                {shown("title")}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="category" className="text-sm font-medium text-text-primary">
                Category
              </label>
              <div className="relative">
                <select
                  id="category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value as OfferCategory)}
                  className={selectClass}
                >
                  {CATEGORY_IDS.map((id) => (
                    <option key={id} value={id}>
                      {CATEGORIES[id]}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
                  aria-hidden="true"
                />
              </div>
            </div>

            {type === "item" ? (
              <div className="grid gap-2">
                <label htmlFor="condition" className="text-sm font-medium text-text-primary">
                  Condition
                </label>
                <div className="relative">
                  <select
                    id="condition"
                    value={condition}
                    onChange={(event) => setCondition(event.target.value as Condition)}
                    className={selectClass}
                  >
                    {CONDITION_IDS.map((id) => (
                      <option key={id} value={id}>
                        {CONDITIONS[id]}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
                    aria-hidden="true"
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-2">
                <label htmlFor="area" className="text-sm font-medium text-text-primary">
                  Area
                </label>
                <div className="relative">
                  <select
                    id="area"
                    value={area}
                    onChange={(event) => setArea(event.target.value)}
                    className={selectClass}
                  >
                    {AREAS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
                    aria-hidden="true"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <label htmlFor="offering" className="text-sm font-medium text-text-primary">
              What you’re offering
            </label>
            <input
              id="offering"
              type="text"
              value={offering}
              onChange={(event) => setOffering(event.target.value)}
              maxLength={200}
              placeholder="The short version members see on the card"
              className={inputClass}
            />
            {shown("offering") ? (
              <p className="text-xs text-state-danger" role="alert">
                {shown("offering")}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label htmlFor="wants" className="text-sm font-medium text-text-primary">
              What you’d like in return
            </label>
            <input
              id="wants"
              type="text"
              value={wants}
              onChange={(event) => setWants(event.target.value)}
              maxLength={200}
              placeholder="e.g. A bicycle, phone repair, or cash"
              className={inputClass}
            />
            {shown("wants") ? (
              <p className="text-xs text-state-danger" role="alert">
                {shown("wants")}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium text-text-primary">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={2000}
              placeholder="Condition, what’s included, anything a member should know"
              className={textareaClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {type === "item" ? (
              <div className="grid gap-2">
                <label htmlFor="area" className="text-sm font-medium text-text-primary">
                  Area
                </label>
                <div className="relative">
                  <select
                    id="area"
                    value={area}
                    onChange={(event) => setArea(event.target.value)}
                    className={selectClass}
                  >
                    {AREAS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
                    aria-hidden="true"
                  />
                </div>
              </div>
            ) : null}

            <div className="grid gap-2">
              <label htmlFor="estimate" className="text-sm font-medium text-text-primary">
                Your estimate of its value
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">
                  ₦
                </span>
                <input
                  id="estimate"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={estimate}
                  onChange={(event) => setEstimate(event.target.value)}
                  placeholder="80,000"
                  className={[inputClass, "tnum pl-7"].join(" ")}
                />
              </div>
            </div>
          </div>

          <fieldset className="grid gap-3">
            <legend className="mb-2 text-sm font-medium text-text-primary">
              How you’ll hand it over
            </legend>
            {HANDOVER_IDS.map((method) => (
              <label key={method} className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={handover.includes(method)}
                  onChange={() => toggleHandover(method)}
                  className="size-4 shrink-0 accent-accent-primary"
                />
                {HANDOVER_METHODS[method]}
              </label>
            ))}
            {shown("handover") ? (
              <p className="text-xs text-state-danger" role="alert">
                {shown("handover")}
              </p>
            ) : null}
          </fieldset>

          <div className="flex flex-wrap gap-3 border-t border-border-default pt-6">
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent-primary px-8 text-base font-semibold text-text-on-accent shadow-sm transition-colors hover:bg-accent-primary-hover"
            >
              Publish offer
            </button>
            <Link
              to="/my-offers"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-subtle hover:text-text-primary"
            >
              Cancel
            </Link>
          </div>
        </form>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 text-sm font-semibold text-text-muted">Live preview</p>
          <div className="pointer-events-none max-w-sm">
            <OfferCard offer={previewOffer} interactive={false} />
          </div>
          <p className="mt-4 max-w-sm text-xs text-text-muted">
            Members see your general area only. Exact addresses are shared inside an agreement.
          </p>
        </aside>
      </div>

      {toast ? (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border border-border-default bg-bg-surface p-4 shadow-lg"
        >
          <p className="text-sm font-semibold text-text-primary">{toast.title}</p>
          <p className="mt-1 text-sm text-text-muted">{toast.description}</p>
        </div>
      ) : null}
    </Container>
  );
}
