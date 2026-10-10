"use client";
// Adapted from beui.dev/components/blocks/bloom-menu
// Visual language aligned with filter-interaction (Estedad, Hugeicons, radius 20).

import {
  Add01Icon,
  Cancel01Icon,
  File01Icon,
  Folder01Icon,
  GridViewIcon,
  LayoutTableIcon,
  Link01Icon,
  ReminderIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const SPRING_FOLDER = {
  type: "spring" as const,
  stiffness: 300,
  damping: 32,
  mass: 0.9,
};

export type BloomMenuItem = {
  id: string;
  label: string;
  icon: IconSvgElement;
};

const DEFAULT_ITEMS: BloomMenuItem[] = [
  { id: "doc", label: "سند", icon: File01Icon },
  { id: "board", label: "بورد", icon: GridViewIcon },
  { id: "table", label: "جدول", icon: LayoutTableIcon },
  { id: "folder", label: "پوشه", icon: Folder01Icon },
  { id: "reminder", label: "یادآور", icon: ReminderIcon },
  { id: "link", label: "پیوند", icon: Link01Icon },
];

export interface BloomMenuProps {
  items?: BloomMenuItem[];
  onSelect?: (item: BloomMenuItem) => void;
  triggerLabel?: string;
  panelTitle?: string;
  className?: string;
}

export function BloomMenu({
  items = DEFAULT_ITEMS,
  onSelect,
  triggerLabel = "ایجاد",
  panelTitle = "ایجاد",
  className,
}: BloomMenuProps) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const layoutId = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const morph = reduce ? { duration: 0.15 } : SPRING_FOLDER;

  return (
    <div ref={ref} className={cn("relative inline-flex", className)}>
      <div className="h-11 w-36" aria-hidden />

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 grid h-75 w-[min(86vw,420px)] -translate-x-1/2 -translate-y-1/2 place-items-center *:pointer-events-auto">
        <AnimatePresence initial={false} mode="popLayout">
          {open ? (
            <motion.div
              key="panel"
              layoutId={layoutId}
              transition={morph}
              style={{ borderRadius: 20 }}
              className="w-[min(86vw,420px)] overflow-hidden border border-border bg-card"
            >
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: reduce ? 0 : 0.12, duration: 0.2 }}
              >
                <div className="flex items-center justify-between border-b border-border px-3 py-2">
                  <span className="text-base text-muted-foreground">
                    {panelTitle}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="بستن منو"
                    className="inline-flex size-9 cursor-default items-center justify-center rounded-2xl text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={18} />
                  </button>
                </div>

                <motion.div
                  initial={
                    reduce ? false : { clipPath: "inset(45% 34% 45% 34%)" }
                  }
                  animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                  transition={{
                    delay: reduce ? 0 : 0.08,
                    duration: 0.45,
                    ease: EASE_OUT,
                  }}
                  className="grid grid-cols-3"
                >
                  {items.map((item, i) => {
                    const cols = 3;
                    const rows = Math.ceil(items.length / cols);
                    const col = i % cols;
                    const row = Math.floor(i / cols);
                    const dist = Math.hypot(
                      col - (cols - 1) / 2,
                      row - (rows - 1) / 2,
                    );
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onSelect?.(item);
                          setOpen(false);
                        }}
                        className={cn(
                          "flex cursor-default items-center justify-center px-3 py-6 text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:bg-accent focus-visible:text-foreground",
                          i % 3 !== 2 && "border-e border-border",
                          i < 3 && "border-b border-border",
                        )}
                      >
                        <motion.span
                          initial={
                            reduce
                              ? { opacity: 0 }
                              : {
                                  opacity: 0,
                                  scale: 0.85,
                                  filter: "blur(6px)",
                                }
                          }
                          animate={{
                            opacity: 1,
                            scale: 1,
                            filter: "blur(0px)",
                          }}
                          transition={{
                            delay: reduce ? 0 : 0.1 + dist * 0.07,
                            type: "spring",
                            stiffness: 440,
                            damping: 34,
                          }}
                          className="flex flex-col items-center gap-2"
                        >
                          <HugeiconsIcon icon={item.icon} size={24} />
                          <span className="text-base leading-6">
                            {item.label}
                          </span>
                        </motion.span>
                      </button>
                    );
                  })}
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.button
              key="trigger"
              type="button"
              layoutId={layoutId}
              transition={morph}
              style={{ borderRadius: 20 }}
              onClick={() => setOpen(true)}
              aria-haspopup="menu"
              aria-expanded={open}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              className="inline-flex h-11 w-36 cursor-default items-center justify-center border border-border bg-card text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <motion.span
                layout
                className="inline-flex items-center gap-2 whitespace-nowrap"
              >
                {triggerLabel}
                <HugeiconsIcon icon={Add01Icon} size={18} />
              </motion.span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** پیش‌نمایش فارسی — زبان بصری filter-interaction. */
export default function BloomMenuExample() {
  return (
    <section
      dir="rtl"
      lang="fa"
      className="relative flex min-h-105 w-full items-start justify-center fill-muted-foreground/70 bg-transparent px-4 pt-24 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <BloomMenu />
    </section>
  );
}
