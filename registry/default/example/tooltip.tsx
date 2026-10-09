"use client";

import {
  useId,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  Download01Icon,
  FavouriteIcon,
  Share01Icon,
} from "@hugeicons/core-free-icons";
import clsx from "clsx";

type Side = "top" | "bottom";

type TooltipProps = {
  label: string;
  side?: Side;
  children: ReactNode;
  className?: string;
};

const ROW_EASE: [number, number, number, number] = [0.215, 0.61, 0.355, 1];

/**
 * Soft card tooltip — same surface language as filter-interaction.
 * Horizontal center uses physical `left-1/2` + `-translate-x-1/2` so RTL
 * does not shift the bubble onto the neighboring trigger.
 */
export function SoftTooltip({
  label,
  side = "top",
  children,
  className,
}: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const fromTop = side === "top";

  return (
    <div
      className={clsx("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <div aria-describedby={open ? id : undefined}>{children}</div>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={id}
            role="tooltip"
            dir="rtl"
            lang="fa"
            initial={{
              opacity: 0,
              y: fromTop ? 8 : -8,
              scale: 0.92,
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: fromTop ? 6 : -6,
              scale: 0.94,
            }}
            transition={{
              type: "spring",
              bounce: 0.2,
              duration: 0.35,
              ease: ROW_EASE,
            }}
            className={clsx(
              "pointer-events-none absolute left-1/2 z-30 -translate-x-1/2",
              fromTop ? "bottom-[calc(100%+12px)]" : "top-[calc(100%+12px)]",
            )}
          >
            <div
              className={clsx(
                "relative whitespace-nowrap border border-border bg-card px-4 py-2.5 text-base text-foreground text-center",
                "font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal",
              )}
              style={{ borderRadius: 16, borderWidth: 1 }}
            >
              {label}
              <span
                aria-hidden
                className={clsx(
                  "absolute left-1/2 size-2.5 -translate-x-1/2 rotate-45 border-border bg-card",
                  fromTop
                    ? "top-full -mt-[5px] border-e border-b"
                    : "bottom-full -mb-[5px] border-s border-t",
                )}
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

// Change Here
const TOOLS = [
  { id: "share", label: "اشتراک‌گذاری", icon: Share01Icon },
  { id: "copy", label: "کپی لینک", icon: Copy01Icon },
  { id: "save", label: "ذخیره", icon: FavouriteIcon },
  { id: "download", label: "دانلود", icon: Download01Icon },
] as const;

export default function Tooltip() {
  return (
    <section
      dir="rtl"
      lang="fa"
      aria-label="نمایش تولتیپ"
      className="flex items-center justify-center fill-muted-foreground/70 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <MotionConfig
        transition={{ type: "spring", duration: 0.85, bounce: 0.35 }}
      >
        <div className="flex items-center gap-3">
          {TOOLS.map((tool) => (
            <SoftTooltip key={tool.id} label={tool.label} side="top">
              <button
                type="button"
                aria-label={tool.label}
                className={clsx(
                  "relative flex size-14 cursor-pointer items-center justify-center",
                  "rounded-full border border-border bg-background text-foreground",
                  "outline-none transition-colors hover:bg-accent",
                  "focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                <span className="text-muted-foreground">
                  <HugeiconsIcon icon={tool.icon} size={24} />
                </span>
              </button>
            </SoftTooltip>
          ))}
        </div>
      </MotionConfig>
    </section>
  );
}
