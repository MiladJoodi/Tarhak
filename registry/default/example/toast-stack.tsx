"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Alert02Icon,
  Cancel01Icon,
  CancelCircleIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";

export type ToastKind = "success" | "error" | "warning";

export type ToastItem = {
  id: string;
  kind: ToastKind;
  title: string;
  description?: string;
};

const KIND: Record<
  ToastKind,
  {
    label: string;
    icon: IconSvgElement;
    accent: string;
    soft: string;
  }
> = {
  success: {
    label: "موفقیت",
    icon: CheckmarkCircle02Icon,
    accent: "#34C759",
    soft: "color-mix(in oklab, #34C759 14%, transparent)",
  },
  error: {
    label: "خطا",
    icon: CancelCircleIcon,
    accent: "#E11D48",
    soft: "color-mix(in oklab, #E11D48 14%, transparent)",
  },
  warning: {
    label: "هشدار",
    icon: Alert02Icon,
    accent: "#D97706",
    soft: "color-mix(in oklab, #D97706 16%, transparent)",
  },
};

const springIn: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 30,
  mass: 0.75,
};

const springLayout: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 32,
  mass: 0.8,
};

const AUTO_MS = 4200;

const PRESETS: Record<ToastKind, Omit<ToastItem, "id">> = {
  success: {
    kind: "success",
    title: "ذخیره شد",
    description: "تغییرات با موفقیت ثبت شدند.",
  },
  error: {
    kind: "error",
    title: "ارسال ناموفق",
    description: "اتصال برقرار نشد؛ دوباره تلاش کنید.",
  },
  warning: {
    kind: "warning",
    title: "فضای کم",
    description: "کمتر از ۱۰٪ فضای ذخیره‌سازی مانده است.",
  },
};

function ToastCard({
  item,
  onDismiss,
  reduce,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
  reduce: boolean;
}) {
  const meta = KIND[item.kind];
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    if (reduce) {
      const t = window.setTimeout(() => onDismiss(item.id), AUTO_MS);
      return () => window.clearTimeout(t);
    }

    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / AUTO_MS);
      setProgress(1 - t);
      if (t < 1) frame = requestAnimationFrame(tick);
      else onDismiss(item.id);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [item.id, onDismiss, reduce]);

  return (
    <motion.div
      layout
      role="status"
      aria-live="polite"
      initial={
        reduce
          ? false
          : { opacity: 0, y: -18, scale: 0.96, filter: "blur(4px)" }
      }
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={
        reduce
          ? { opacity: 0 }
          : { opacity: 0, y: -12, scale: 0.96, filter: "blur(4px)" }
      }
      transition={springIn}
      className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      style={{ borderInlineStartWidth: 3, borderInlineStartColor: meta.accent }}
    >
      <div
        className="flex items-start gap-3 px-3.5 py-3"
        style={{ background: meta.soft }}
      >
        <span
          className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full"
          style={{ background: meta.soft, color: meta.accent }}
        >
          <HugeiconsIcon icon={meta.icon} size={20} />
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-medium text-foreground">{item.title}</p>
          {item.description ? (
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          aria-label="بستن اعلان"
          onClick={() => onDismiss(item.id)}
          className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={16} />
        </button>
      </div>
      {!reduce ? (
        <div className="h-0.5 w-full bg-border/60">
          <div
            className="h-full origin-right transition-none"
            style={{
              width: `${progress * 100}%`,
              background: meta.accent,
            }}
          />
        </div>
      ) : null}
    </motion.div>
  );
}

export default function ToastStack() {
  const reduce = useReducedMotion() ?? false;
  const uid = useId().replace(/:/g, "");
  const seq = useRef(0);
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((kind: ToastKind) => {
    seq.current += 1;
    const preset = PRESETS[kind];
    const next: ToastItem = {
      ...preset,
      id: `${uid}-${seq.current}`,
    };
    setItems((prev) => [next, ...prev].slice(0, 4));
  }, [uid]);

  return (
    <section
      dir="rtl"
      lang="fa"
      aria-label="پشتهٔ اعلان"
      className="relative flex w-full max-w-md flex-col font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <div className="overflow-hidden rounded-[24px] border border-border bg-card px-4 py-4 text-foreground">
        <header className="mb-4 px-1">
          <h2 className="text-lg font-medium">اعلان‌ها</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            موفقیت، خطا و هشدار با ورود و خروج فنری
          </p>
        </header>

        <div className="mb-4 flex flex-wrap gap-2">
          {(["success", "error", "warning"] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => push(kind)}
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-accent"
            >
              <span
                className="size-2 rounded-full"
                style={{ background: KIND[kind].accent }}
              />
              {KIND[kind].label}
            </button>
          ))}
        </div>

        <div className="relative min-h-55 rounded-2xl border border-dashed border-border/80 bg-muted/30 p-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {items.length === 0 ? (
              <motion.p
                key="empty"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-muted-foreground"
              >
                یکی از دکمه‌ها را بزن تا اعلان بیاید
              </motion.p>
            ) : null}
          </AnimatePresence>

          <motion.div layout transition={springLayout} className="flex flex-col gap-2">
            <AnimatePresence mode="popLayout" initial={false}>
              {items.map((item) => (
                <ToastCard
                  key={item.id}
                  item={item}
                  onDismiss={dismiss}
                  reduce={reduce}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
