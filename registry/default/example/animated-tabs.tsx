"use client";

import {
  AnimatePresence,
  LayoutGroup,
  motion,
  MotionConfig,
  useReducedMotion,
} from "motion/react";
import { useId, useRef, useState } from "react";
import clsx from "clsx";

type Tab = {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  body: string;
  stats: { label: string; value: string }[];
};

// Change Here
const TABS: Tab[] = [
  {
    id: "overview",
    label: "نمای کلی",
    eyebrow: "خلاصه",
    title: "همه‌چیز در یک نگاه",
    body: "وضعیت پروژه، پیشرفت هفتگی و نکات مهم را بدون جابه‌جایی بین صفحات ببینید.",
    stats: [
      { label: "پیشرفت", value: "۷۲٪" },
      { label: "وظایف", value: "۱۸" },
      { label: "اعضا", value: "۶" },
    ],
  },
  {
    id: "activity",
    label: "فعالیت‌ها",
    eyebrow: "به‌روز",
    title: "آخرین تغییرات تیم",
    body: "نظرها، آپلودها و تأییدها با ترتیب زمانی می‌آیند تا همیشه بدانید چه کسی چه کاری کرده.",
    stats: [
      { label: "امروز", value: "۹" },
      { label: "در انتظار", value: "۳" },
      { label: "انجام‌شده", value: "۱۴" },
    ],
  },
  {
    id: "settings",
    label: "تنظیمات",
    eyebrow: "کنترل",
    title: "ترجیحات فضای کار",
    body: "اعلان‌ها، سطح دسترسی و ظاهر رابط را از همین‌جا تنظیم کنید؛ تغییرات فوری اعمال می‌شوند.",
    stats: [
      { label: "اعلان", value: "روشن" },
      { label: "تم", value: "خودکار" },
      { label: "نقش", value: "ادمین" },
    ],
  },
];

const ROW_EASE: [number, number, number, number] = [0.215, 0.61, 0.355, 1];

const pillSpring = {
  type: "spring" as const,
  bounce: 0.2,
  duration: 0.55,
};

export function AnimatedTabsForm() {
  const reduceMotion = useReducedMotion() ?? false;
  const layoutGroup = useId().replace(/:/g, "");
  const pillId = `${layoutGroup}-pill`;
  const [activeId, setActiveId] = useState(TABS[0]!.id);
  const prevIndexRef = useRef(0);

  const activeIndex = TABS.findIndex((t) => t.id === activeId);
  const active = TABS[activeIndex] ?? TABS[0]!;
  const direction = activeIndex >= prevIndexRef.current ? 1 : -1;

  const select = (id: string) => {
    const next = TABS.findIndex((t) => t.id === id);
    if (next < 0 || id === activeId) return;
    prevIndexRef.current = activeIndex;
    setActiveId(id);
  };

  return (
    <MotionConfig
      transition={{ type: "spring", duration: 0.85, bounce: 0.35 }}
    >
      <section
        aria-label="تب‌های متحرک"
        className="w-full max-w-[440px] fill-muted-foreground/70 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
        dir="rtl"
        lang="fa"
      >
        <div
          className="overflow-hidden border border-border bg-card"
          style={{ borderRadius: 20, borderWidth: 1 }}
        >
          <div className="border-b border-border px-4 pt-4 pb-3 md:px-5 md:pt-5">
            <p className="text-sm text-muted-foreground">فضای کار</p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">
              تب‌های متحرک
            </h2>

            <LayoutGroup id={layoutGroup}>
              <div
                role="tablist"
                aria-label="بخش‌ها"
                className="relative mt-4 flex gap-1 rounded-2xl border border-border bg-background p-1"
              >
                {TABS.map((tab) => {
                  const selected = tab.id === activeId;
                  return (
                    <motion.button
                      key={tab.id}
                      type="button"
                      role="tab"
                      id={`${layoutGroup}-tab-${tab.id}`}
                      aria-selected={selected}
                      aria-controls={`${layoutGroup}-panel-${tab.id}`}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => select(tab.id)}
                      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                      className={clsx(
                        "relative z-0 flex-1 cursor-pointer rounded-2xl px-3 py-2.5 text-base outline-none",
                        "focus-visible:ring-2 focus-visible:ring-ring",
                      )}
                    >
                      {selected ? (
                        <motion.span
                          layoutId={pillId}
                          className="absolute inset-0 -z-10 rounded-2xl bg-accent"
                          transition={
                            reduceMotion ? { duration: 0 } : pillSpring
                          }
                          style={{ borderRadius: 16 }}
                        />
                      ) : null}
                      <span
                        className={clsx(
                          "relative block",
                          selected
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {tab.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </LayoutGroup>
          </div>

          <div className="relative min-h-[248px] overflow-hidden px-5 py-6 md:px-6 md:py-7">
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
              <motion.div
                key={active.id}
                role="tabpanel"
                id={`${layoutGroup}-panel-${active.id}`}
                aria-labelledby={`${layoutGroup}-tab-${active.id}`}
                custom={direction}
                initial={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, x: direction * -24, y: 16 }
                }
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, x: direction * 24, y: -8 }
                }
                transition={
                  reduceMotion
                    ? { duration: 0.12 }
                    : {
                        type: "spring",
                        bounce: 0.1,
                        duration: 0.35,
                        ease: ROW_EASE,
                      }
                }
                className="flex flex-col"
              >
                <p className="text-sm text-muted-foreground">{active.eyebrow}</p>

                <h3 className="mt-2 text-xl font-semibold text-foreground">
                  {active.title}
                </h3>

                <p className="mt-2 text-base leading-7 text-muted-foreground">
                  {active.body}
                </p>

                <div className="mt-6 grid grid-cols-3 gap-2">
                  {active.stats.map((stat, i) => (
                    <motion.div
                      key={`${active.id}-${stat.label}`}
                      initial={
                        reduceMotion
                          ? false
                          : { opacity: 0, y: 24 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : {
                              type: "spring",
                              bounce: 0.1,
                              duration: 0.25,
                              delay: (i + 8) * 0.025,
                              ease: ROW_EASE,
                            }
                      }
                      className="rounded-2xl border border-border bg-background px-3 py-3"
                    >
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">
                        {stat.value}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}

export default function AnimatedTabs() {
  return (
    <div
      dir="rtl"
      lang="fa"
      className="flex h-full w-full items-center justify-center px-4 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <AnimatedTabsForm />
    </div>
  );
}
