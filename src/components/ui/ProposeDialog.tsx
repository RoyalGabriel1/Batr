import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { formatNaira, platformFee } from "../../lib/format";
import { Button } from "./Button";
import { ExchangeGlyph } from "./ExchangePair";

export interface ProposalValues {
  value: string;
  cash?: number;
  note?: string;
}

interface ProposeDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** The side that is fixed by the deal (the offer on the table). */
  fixedLabel: string;
  fixedValue: string;
  /** The side the member is proposing. */
  editableLabel: string;
  editablePlaceholder: string;
  editableDefault?: string;
  noteDefault?: string;
  submitLabel: string;
  /** Value used to quote the fee next to the cash field. */
  estimate?: number;
  onSubmit: (values: ProposalValues) => void;
}

export function ProposeDialog({
  open,
  onClose,
  title,
  fixedLabel,
  fixedValue,
  editableLabel,
  editablePlaceholder,
  editableDefault = "",
  noteDefault = "",
  submitLabel,
  estimate,
  onSubmit,
}: ProposeDialogProps) {
  const [value, setValue] = useState(editableDefault);
  const [cash, setCash] = useState("");
  const [note, setNote] = useState(noteDefault);

  useEffect(() => {
    if (open) {
      setValue(editableDefault);
      setCash("");
      setNote(noteDefault);
    }
    // Reset whenever the dialog opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const cashNumber = cash.trim() === "" ? undefined : Math.max(0, Math.round(Number(cash) || 0));
  const fee = estimate ? platformFee(estimate) : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-bg-inverse/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="pop relative z-10 max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-xl border border-border-default bg-bg-surface p-6 shadow-lg sm:rounded-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-h3 text-text-primary">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 inline-flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-bg-subtle hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="rounded-lg border border-border-default bg-bg-base p-3">
            <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">
              {fixedLabel}
            </p>
            <p className="mt-1 text-body-sm text-text-primary">{fixedValue}</p>
          </div>

          <div className="flex justify-center">
            <ExchangeGlyph className="h-8 w-8" />
          </div>

          <label className="block">
            <span className="text-caption font-semibold uppercase tracking-wide text-text-muted">
              {editableLabel}
            </span>
            <input
              type="text"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={editablePlaceholder}
              className="mt-1.5 w-full rounded-md border border-border-default bg-bg-surface px-3 py-2.5 text-body-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary"
            />
          </label>

          <label className="block">
            <span className="text-caption font-semibold uppercase tracking-wide text-text-muted">
              Cash on top (optional)
            </span>
            <div className="mt-1.5 flex items-center rounded-md border border-border-default bg-bg-surface focus-within:border-accent-primary">
              <span className="pl-3 text-body-sm text-text-muted">₦</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={cash}
                onChange={(event) => setCash(event.target.value)}
                placeholder="0"
                className="w-full rounded-md bg-transparent px-2 py-2.5 text-body-sm text-text-primary tnum placeholder:text-text-muted focus:outline-none"
              />
            </div>
            {fee ? (
              <span className="mt-1 block text-caption text-text-muted">
                BATR fee on a {formatNaira(estimate ?? 0)} exchange is {formatNaira(fee)}, shared
                equally.
              </span>
            ) : null}
          </label>

          <label className="block">
            <span className="text-caption font-semibold uppercase tracking-wide text-text-muted">
              Add a note (optional)
            </span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              placeholder="Anything the other member should know"
              className="mt-1.5 w-full resize-y rounded-md border border-border-default bg-bg-surface px-3 py-2.5 text-body-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={value.trim().length === 0}
            onClick={() => onSubmit({ value: value.trim(), cash: cashNumber, note: note.trim() })}
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
