"use client";

import * as React from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { useFeedbackEligibility } from "@/hooks/use-feedback-eligibility";
import { startSponsorCheckout } from "@/lib/sponsor/checkout";
import { cn } from "@/lib/utils";
import { FeedbackDialog } from "./feedback-dialog";
import { FeedbackIcon, PlusIcon } from "./icons";

/** The browse logo placement is a Gold perk, so the slot opens Gold checkout. */
const SLOT_TIER = "gold" as const;

/** Figma 1:79 — the sponsor slot and feedback button that float over the
 *  browse panel in both canvas and grid view. Rendered outside the scroller
 *  so the grid view cannot scroll them away. */
export function BrowseFloatingActions() {
  const { user } = useAuth();
  const { canSubmit, markSubmitted } = useFeedbackEligibility();
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);
  const [checkoutPending, setCheckoutPending] = React.useState(false);
  const [checkoutError, setCheckoutError] = React.useState<string | null>(null);

  async function openCheckout() {
    if (checkoutPending) return;
    setCheckoutPending(true);
    setCheckoutError(null);
    try {
      await startSponsorCheckout(SLOT_TIER);
    } catch (error) {
      setCheckoutError(
        error instanceof Error ? error.message : "Could not start checkout",
      );
      setCheckoutPending(false);
    }
  }

  return (
    <>
      <div className="pointer-events-none absolute right-2.5 bottom-2.5 z-10 flex flex-col items-end justify-center gap-2">
        {/* Figma 1:80 */}
        <div className="pointer-events-auto flex w-[286px] flex-col items-start overflow-hidden rounded-2xl border-[0.6px] border-border bg-[#26262b] shadow-[0px_-1px_0px_0px_rgba(255,255,255,0.04),0px_2px_4px_-4px_rgba(0,0,0,0.16),0px_4px_8px_-10px_rgba(0,0,0,0.08)]">
          <div className="flex w-full items-center border-b-[0.6px] border-border p-2.5 text-base text-white">
            Sponsor Slot
          </div>
          <div className="w-full px-2.5 py-3">
            {/* Figma 1:85 — the dashed placement a sponsor would take. */}
            <button
              type="button"
              onClick={() => void openCheckout()}
              disabled={checkoutPending}
              aria-label="Sponsor useLayouts and add your logo here"
              className={cn(
                "flex w-full cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-[10px] p-3",
                "border border-dashed border-[#4e4e55] text-sm uppercase text-white",
                "transition-colors duration-150 ease-out motion-reduce:transition-none",
                "[@media(hover:hover)_and_(pointer:fine)]:hover:border-[#6b6b73] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/4",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring",
                "disabled:cursor-not-allowed disabled:opacity-60",
              )}
            >
              <PlusIcon className="size-4 shrink-0" />
              <span>{checkoutPending ? "Opening…" : "Add your logo Here"}</span>
            </button>
            {checkoutError ? (
              <p className="pt-2 text-[12px] text-red-400" role="alert">
                {checkoutError}
              </p>
            ) : null}
          </div>
        </div>

        {/* Figma 1:90 — same raised fill as the dock's pause control. Signed-in
            only (the fortnight limit is per account), and gone once they have
            had their say: a button you cannot use is worse than no button. */}
        {user && canSubmit ? (
          <button
            type="button"
            onClick={() => setFeedbackOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={feedbackOpen}
            className={cn(
              "pointer-events-auto relative flex cursor-pointer items-center gap-2 overflow-hidden rounded-[14px] px-4 py-2.5",
              "bg-secondary text-base text-white",
              "shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.16),0px_4px_4px_-2px_rgba(0,0,0,0.24),0px_0px_0px_1px_rgba(0,0,0,0.1)]",
              "transition-[transform,background-color] duration-150 ease-out active:scale-[0.98] motion-reduce:transition-none",
              "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[hsl(240_6%_28%)]",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring",
            )}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[inherit] bg-linear-to-b from-transparent to-black/6 shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.05)]"
            />
            <FeedbackIcon className="relative size-[18px] shrink-0" />
            <span className="relative">Suggest Feedback</span>
          </button>
        ) : null}
      </div>

      {user ? (
        <FeedbackDialog
          open={feedbackOpen}
          onOpenChange={setFeedbackOpen}
          onSubmitted={markSubmitted}
        />
      ) : null}
    </>
  );
}
