"use client";

import { useEffect, useId, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  MotionConfig,
  useReducedMotion,
} from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  Cancel01Icon,
  Location01Icon,
  StarIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import clsx from "clsx";

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

function toFaDigits(value: string | number) {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)]!);
}

const spring = {
  type: "spring" as const,
  stiffness: 380,
  damping: 34,
  mass: 0.85,
};

export type ExpandableCardItem = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  place: string;
  date: string;
  rating: number;
  guests: number;
  tone: string;
  accent: string;
};

const DEMO_ITEMS: ExpandableCardItem[] = [
  {
    id: "yazd",
    title: "اقامتگاه یزد",
    subtitle: "خانهٔ خشتی با حیاط مرکزی",
    description:
      "شب‌های کویری، صبحانهٔ محلی و سکوت حیاط. مناسب زوج‌ها و سفر کوتاه آخر هفته.",
    place: "یزد، فهادان",
    date: "۱۲–۱۵ فروردین",
    rating: 4.9,
    guests: 2,
    tone: "oklch(0.42 0.06 55)",
    accent: "oklch(0.78 0.08 75)",
  },
  {
    id: "rasht",
    title: "کلبهٔ گیلان",
    subtitle: "میان شالی و مه صبحگاهی",
    description:
      "تراس چوبی رو به شالیزار، چای زغالی و مسیر پیاده‌روی تا رودخانهٔ نزدیک.",
    place: "رشت، اطراف ماسوله",
    date: "۲۰–۲۳ اردیبهشت",
    rating: 4.7,
    guests: 4,
    tone: "oklch(0.38 0.07 160)",
    accent: "oklch(0.72 0.09 145)",
  },
  {
    id: "kish",
    title: "سوئیت ساحلی",
    subtitle: "نمای مستقیم به آب",
    description:
      "غروب روی اسکله، صبحانه کنار پنجره و دسترسی پیاده به ساحل عمومی.",
    place: "کیش، ساحل شرقی",
    date: "۵–۸ خرداد",
    rating: 4.8,
    guests: 3,
    tone: "oklch(0.4 0.08 240)",
    accent: "oklch(0.74 0.08 220)",
  },
];

type SoftExpandableCardProps = {
  items?: ExpandableCardItem[];
};

/** Compact cards that morph into a large detail view via shared layoutIds. */
export function SoftExpandableCard({
  items = DEMO_ITEMS,
}: SoftExpandableCardProps) {
  const reduce = useReducedMotion() ?? false;
  const uid = useId().replace(/:/g, "");
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = items.find((item) => item.id === activeId) ?? null;

  useEffect(() => {
    if (!activeId) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveId(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeId]);

  return (
    <LayoutGroup id={uid}>
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <motion.button
            key={item.id}
            type="button"
            layoutId={reduce ? undefined : `card-${uid}-${item.id}`}
            onClick={() => setActiveId(item.id)}
            whileTap={reduce ? undefined : { scale: 0.98 }}
            transition={reduce ? { duration: 0.15 } : spring}
            className={clsx(
              "group relative flex cursor-pointer flex-col overflow-hidden border border-border bg-card text-start outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring",
              activeId === item.id && "invisible",
            )}
            style={{ borderRadius: 18, borderWidth: 1 }}
            aria-expanded={activeId === item.id}
          >
            <motion.div
              layoutId={reduce ? undefined : `media-${uid}-${item.id}`}
              className="relative h-28 w-full overflow-hidden"
              transition={reduce ? { duration: 0.15 } : spring}
              style={{
                background: `linear-gradient(145deg, ${item.accent} 0%, ${item.tone} 70%)`,
              }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),transparent_55%)]" />
              <span className="absolute bottom-2 start-2 inline-flex items-center gap-1 rounded-full bg-black/35 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
                <HugeiconsIcon icon={StarIcon} size={12} />
                {toFaDigits(item.rating)}
              </span>
            </motion.div>

            <div className="flex flex-col gap-1 p-3">
              <motion.h3
                layoutId={reduce ? undefined : `title-${uid}-${item.id}`}
                className="truncate text-base font-medium text-foreground"
                transition={reduce ? { duration: 0.15 } : spring}
              >
                {item.title}
              </motion.h3>
              <p className="truncate text-sm text-muted-foreground">
                {item.subtitle}
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {active ? (
          <motion.div
            key="overlay"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.12 : 0.2 }}
          >
            <motion.button
              type="button"
              aria-label="بستن"
              className="absolute inset-0 cursor-pointer bg-black/55 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveId(null)}
            />

            <motion.article
              layoutId={reduce ? undefined : `card-${uid}-${active.id}`}
              role="dialog"
              aria-modal="true"
              aria-label={active.title}
              transition={reduce ? { duration: 0.15 } : spring}
              className="relative z-10 flex w-full max-w-[380px] flex-col overflow-hidden border border-border bg-card shadow-[0_24px_60px_-24px_rgba(0,0,0,0.65)]"
              style={{ borderRadius: 22, borderWidth: 1 }}
            >
              <motion.div
                layoutId={reduce ? undefined : `media-${uid}-${active.id}`}
                className="relative h-48 w-full overflow-hidden"
                transition={reduce ? { duration: 0.15 } : spring}
                style={{
                  background: `linear-gradient(145deg, ${active.accent} 0%, ${active.tone} 70%)`,
                }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_55%)]" />
                <button
                  type="button"
                  aria-label="بستن"
                  onClick={() => setActiveId(null)}
                  className="absolute top-3 end-3 flex size-9 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/35 text-white outline-none backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-white/50"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={18} />
                </button>
              </motion.div>

              <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-col gap-1">
                  <motion.h3
                    layoutId={
                      reduce ? undefined : `title-${uid}-${active.id}`
                    }
                    className="text-xl font-medium text-foreground"
                    transition={reduce ? { duration: 0.15 } : spring}
                  >
                    {active.title}
                  </motion.h3>
                  <motion.p
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduce ? 0 : 0.08, ...spring }}
                    className="text-sm text-muted-foreground"
                  >
                    {active.subtitle}
                  </motion.p>
                </div>

                <motion.p
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduce ? 0 : 0.12, ...spring }}
                  className="text-sm leading-relaxed text-foreground/90"
                >
                  {active.description}
                </motion.p>

                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduce ? 0 : 0.16, ...spring }}
                  className="grid grid-cols-2 gap-2"
                >
                  <Meta
                    icon={Location01Icon}
                    label="مکان"
                    value={active.place}
                  />
                  <Meta
                    icon={Calendar03Icon}
                    label="تاریخ"
                    value={active.date}
                  />
                  <Meta
                    icon={StarIcon}
                    label="امتیاز"
                    value={toFaDigits(active.rating)}
                  />
                  <Meta
                    icon={UserIcon}
                    label="مهمان"
                    value={toFaDigits(active.guests)}
                  />
                </motion.div>

                <motion.button
                  type="button"
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduce ? 0 : 0.2, ...spring }}
                  whileTap={reduce ? undefined : { scale: 0.98 }}
                  className="mt-1 inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-2xl bg-primary text-base font-medium text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => setActiveId(null)}
                >
                  رزرو این اقامتگاه
                </motion.button>
              </div>
            </motion.article>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </LayoutGroup>
  );
}

function Meta({
  icon,
  label,
  value,
}: {
  icon: typeof Location01Icon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 rounded-2xl border border-border bg-background px-3 py-2.5">
      <span className="mt-0.5 text-muted-foreground">
        <HugeiconsIcon icon={icon} size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default function ExpandableCard() {
  return (
    <section
      dir="rtl"
      lang="fa"
      aria-label="کارت گسترش‌پذیر"
      className="flex w-full max-w-[720px] flex-col gap-4 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <MotionConfig transition={spring}>
        <div className="px-1">
          <p className="text-base font-medium text-foreground">اقامتگاه‌ها</p>
          <p className="text-sm text-muted-foreground">
            روی کارت بزن تا به نمای بزرگ تبدیل شود
          </p>
        </div>
        <SoftExpandableCard />
      </MotionConfig>
    </section>
  );
}
