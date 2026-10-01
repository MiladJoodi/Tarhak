"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { useAuth } from "@/components/auth/auth-provider";
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

/** Same five faces as the multi-step-form's last step, scored 1–5. */
const RATINGS = [
  { emoji: "😰", value: 1, label: "Frustrating" },
  { emoji: "😟", value: 2, label: "Rough" },
  { emoji: "😐", value: 3, label: "Fine" },
  { emoji: "🙂", value: 4, label: "Good" },
  { emoji: "🤩", value: 5, label: "Great" },
] as const;

/** Enough to say something actionable; short enough not to be a chore. */
const MIN_COMMENT = 30;

/** The login dialog's field shadow stack, so inputs read the same in both. */
const FIELD_SHADOW =
  "shadow-[0px_-1px_0px_0px_rgba(255,255,255,0.06),0px_0px_0px_1px_rgba(255,255,255,0.06),0px_0px_0px_1px_#27272a,0px_0px_1px_1.5px_rgba(0,0,0,0.24),0px_2px_2px_0px_rgba(0,0,0,0.24)]";

export function FeedbackDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user, configured } = useAuth();
  const [rating, setRating] = React.useState<number | null>(null);
  const [comment, setComment] = React.useState("");
  const [status, setStatus] = React.useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(false);

  const trimmed = comment.trim();
  const tooShort = trimmed.length < MIN_COMMENT;
  const lengthError = submitted && tooShort;

  React.useEffect(() => {
    if (open) return;
    setRating(null);
    setComment("");
    setStatus("idle");
    setError(null);
    setSubmitted(false);
  }, [open]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (status === "sending") return;

    setSubmitted(true);
    if (rating === null || tooShort) return;

    setStatus("sending");
    setError(null);

    if (!configured) {
      setStatus("error");
      setError("Feedback is not configured yet.");
      return;
    }

    const { error: insertError } = await createClient()
      .from("feedback")
      .insert({
        user_id: user?.id ?? null,
        rating,
        comment: trimmed.slice(0, 2000),
        path: window.location.pathname,
      });

    if (insertError) {
      setStatus("error");
      // The message itself in development: "could not send" hides the real
      // cause, which is usually a migration that has not been applied.
      setError(
        process.env.NODE_ENV === "development"
          ? insertError.message
          : "Could not send that. Try again in a moment.",
      );
      return;
    }

    setStatus("sent");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/10 supports-backdrop-filter:backdrop-blur-[3.35px]" />
        <DialogPrimitive.Popup
          data-slot="dialog-content"
          className={cn(
            "fixed top-1/2 left-1/2 z-999999 w-[min(calc(100%-2rem),420px)] -translate-x-1/2 -translate-y-1/2 outline-none",
            "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 duration-100",
          )}
        >
          <DialogTitle className="sr-only">Suggest feedback</DialogTitle>
          <DialogDescription className="sr-only">
            Rate how useLayouts feels to use and add a comment.
          </DialogDescription>

          <div className="relative flex w-full flex-col overflow-clip rounded-[24px] p-[26px] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.2),0px_1px_3px_0px_rgba(0,0,0,0.4),0px_0px_3px_0px_rgba(0,0,0,0.2)]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[24px] bg-[#131316]"
            />
            <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_1px_1px_rgba(255,255,255,0.01)]" />

            {status === "sent" ? (
              <div className="relative flex w-full flex-col items-center gap-5 py-2 text-center">
                <span
                  aria-hidden
                  className="flex size-14 items-center justify-center rounded-full bg-white/6 text-[30px] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.08)]"
                >
                  {RATINGS.find((option) => option.value === rating)?.emoji}
                </span>
                <div className="flex flex-col gap-1.5">
                  <p className="text-[20px] font-medium tracking-[-0.3px] text-white">
                    Thanks — that helps
                  </p>
                  <p className="text-[14px] leading-5 text-[#8e8e93]">
                    Every note gets read, and it decides what we build next.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "relative flex w-full cursor-pointer items-center justify-center overflow-clip rounded-[10px] px-2.5 py-2",
                    "bg-[hsl(230_77%_55%)]",
                    "shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.16),0px_4px_4px_-2px_rgba(0,0,0,0.24),0px_0px_0px_1px_rgba(0,0,0,0.12)]",
                    "transition-[transform,background-color] duration-150 active:scale-[0.98]",
                    "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[hsl(230_77%_58%)]",
                  )}
                >
                  <span className="relative text-[14px] font-medium leading-5 tracking-[-0.084px] text-white">
                    Back to browsing
                  </span>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0.2px_rgba(255,255,255,0.16)]"
                  />
                </button>
              </div>
            ) : (
              <form
                onSubmit={submit}
                className="relative flex w-full flex-col gap-5"
              >
                <div className="flex flex-col gap-1.5">
                  <p className="text-[20px] font-medium tracking-[-0.3px] text-white">
                    How can we improve useLayouts?
                  </p>
                  <p className="text-[14px] leading-5 text-[#8e8e93]">
                    Rate it, then tell us what is missing, broken, or worth
                    building next.
                  </p>
                </div>

                <div
                  role="radiogroup"
                  aria-label="Rating"
                  className={cn(
                    "relative overflow-hidden rounded-xl bg-[hsl(240_2%_7%)]",
                    FIELD_SHADOW,
                  )}
                >
                  <div className="flex w-full divide-x divide-white/8 border-b border-white/8">
                    {RATINGS.map((option) => {
                      const selected = rating === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          aria-label={option.label}
                          title={option.label}
                          onClick={() => setRating(option.value)}
                          className={cn(
                            "flex-1 cursor-pointer p-3 text-2xl transition-[background-color,filter] duration-150 outline-none",
                            "focus-visible:bg-white/8",
                            selected
                              ? "bg-white/8 grayscale-0"
                              : "grayscale [@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/4 [@media(hover:hover)_and_(pointer:fine)]:hover:grayscale-0",
                          )}
                        >
                          {option.emoji}
                        </button>
                      );
                    })}
                  </div>
                  <Textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    maxLength={2000}
                    placeholder="Add a comment..."
                    aria-label="Comment"
                    aria-invalid={lengthError}
                    className="min-h-[120px] max-h-[120px] w-full resize-none overflow-y-auto wrap-anywhere rounded-none border-0 bg-transparent p-4 text-[14px] text-white placeholder:text-[#71717a] focus-visible:ring-0"
                  />
                </div>

                {lengthError || error ? (
                  <p className="text-[13px] text-red-400" role="alert">
                    {lengthError
                      ? `Please write at least ${MIN_COMMENT} characters so we can act on it.`
                      : error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={rating === null || status === "sending"}
                  className={cn(
                    "relative flex w-full cursor-pointer items-center justify-center overflow-clip rounded-[10px] px-2.5 py-2",
                    "bg-[hsl(230_77%_55%)]",
                    "shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.16),0px_4px_4px_-2px_rgba(0,0,0,0.24),0px_0px_0px_1px_rgba(0,0,0,0.12)]",
                    "transition-[transform,background-color] duration-150 active:scale-[0.98]",
                    "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[hsl(230_77%_58%)]",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                  )}
                >
                  <span className="relative text-[14px] font-medium leading-5 tracking-[-0.084px] text-white">
                    {status === "sending" ? "Sending…" : "Submit feedback"}
                  </span>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0.2px_rgba(255,255,255,0.16)]"
                  />
                </button>
              </form>
            )}
          </div>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}
