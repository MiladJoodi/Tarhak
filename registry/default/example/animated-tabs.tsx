"use client";

import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "motion/react";
import { useId, useRef, useState } from "react";

type Tab = {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  body: string;
  stats: { label: string; value: string }[];
};

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

/** Heavy glide — pill feels physical, not snappy. */
const pillSpring = {
  type: "spring" as const,
  stiffness: 220,
  damping: 24,
  mass: 1.2,
};

const easeOut = [0.16, 1, 0.3, 1] as const;

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
    <section
      aria-label="تب‌های متحرک"
      className="w-full max-w-[440px]"
      dir="rtl"
      lang="fa"
    >
      <motion.div
        layout
        transition={reduceMotion ? { duration: 0 } : { layout: pillSpring }}
        className="overflow-hidden rounded-[28px] bg-white shadow-[0_28px_56px_rgba(15,23,42,0.1)] ring-1 ring-slate-900/8 dark:bg-zinc-950 dark:shadow-[0_28px_56px_rgba(0,0,0,0.45)] dark:ring-white/10"
      >
        <div className="border-b border-slate-900/6 px-4 pt-4 pb-3 dark:border-white/8 md:px-5 md:pt-5">
          <p className="text-[12px] font-medium text-slate-500 dark:text-zinc-400">
            فضای کار
          </p>
          <h2 className="mt-1 text-[20px] font-bold text-slate-900 md:text-[22px] dark:text-slate-50">
            تب‌های متحرک
          </h2>

          <LayoutGroup id={layoutGroup}>
            <div
              role="tablist"
              aria-label="بخش‌ها"
              className="relative mt-4 flex gap-1 rounded-full bg-slate-100/90 p-1 dark:bg-zinc-900"
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
                    className="relative z-0 flex-1 cursor-pointer rounded-full px-3 py-2.5 text-[13px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50 dark:focus-visible:ring-zinc-500/50"
                  >
                    {selected ? (
                      <motion.span
                        layoutId={pillId}
                        className="absolute inset-0 -z-10 rounded-full bg-white shadow-[0_1px_0_rgba(15,23,42,0.04),0_10px_24px_rgba(15,23,42,0.1)] ring-1 ring-slate-900/6 dark:bg-zinc-800 dark:shadow-[0_10px_28px_rgba(0,0,0,0.45)] dark:ring-white/10"
                        transition={
                          reduceMotion ? { duration: 0 } : pillSpring
                        }
                        style={{ borderRadius: 9999 }}
                      />
                    ) : null}
                    <motion.span
                      className="relative block"
                      animate={
                        reduceMotion
                          ? undefined
                          : selected
                            ? { opacity: 1, y: 0 }
                            : { opacity: 0.72, y: 0 }
                      }
                      transition={{ duration: 0.28, ease: easeOut }}
                    >
                      <span
                        className={
                          selected
                            ? "text-slate-900 dark:text-slate-50"
                            : "text-slate-500 dark:text-zinc-400"
                        }
                      >
                        {tab.label}
                      </span>
                    </motion.span>
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
                  : {
                      opacity: 0,
                      x: direction * -56,
                      y: 12,
                      filter: "blur(12px)",
                      scale: 0.94,
                    }
              }
              animate={{
                opacity: 1,
                x: 0,
                y: 0,
                filter: "blur(0px)",
                scale: 1,
              }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      x: direction * 48,
                      y: -10,
                      filter: "blur(10px)",
                      scale: 0.96,
                    }
              }
              transition={
                reduceMotion
                  ? { duration: 0.12 }
                  : {
                      type: "spring",
                      stiffness: 280,
                      damping: 30,
                      mass: 0.9,
                      opacity: { duration: 0.32, ease: easeOut },
                      filter: { duration: 0.4, ease: easeOut },
                    }
              }
              className="flex flex-col will-change-transform"
            >
              <motion.p
                initial={reduceMotion ? false : { opacity: 0, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { delay: 0.08, duration: 0.42, ease: easeOut }
                }
                className="text-[11px] font-bold tracking-[0.16em] text-slate-500 dark:text-zinc-400"
              >
                {active.eyebrow}
              </motion.p>

              <motion.h3
                initial={
                  reduceMotion
                    ? false
                    : { opacity: 0, y: 20, filter: "blur(6px)" }
                }
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { delay: 0.14, duration: 0.48, ease: easeOut }
                }
                className="mt-2 text-[18px] font-bold text-slate-900 md:text-[20px] dark:text-slate-50"
              >
                {active.title}
              </motion.h3>

              <motion.p
                initial={
                  reduceMotion
                    ? false
                    : { opacity: 0, y: 22, filter: "blur(6px)" }
                }
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { delay: 0.2, duration: 0.5, ease: easeOut }
                }
                className="mt-2 text-[13.5px] leading-7 text-slate-500 dark:text-zinc-400"
              >
                {active.body}
              </motion.p>

              <div className="mt-6 grid grid-cols-3 gap-2">
                {active.stats.map((stat, i) => (
                  <motion.div
                    key={`${active.id}-${stat.label}`}
                    initial={
                      reduceMotion
                        ? false
                        : {
                            opacity: 0,
                            y: 28,
                            scale: 0.86,
                            filter: "blur(4px)",
                          }
                    }
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      filter: "blur(0px)",
                    }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : {
                            delay: 0.26 + i * 0.09,
                            type: "spring",
                            stiffness: 280,
                            damping: 20,
                            mass: 0.75,
                          }
                    }
                    className="rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-slate-900/5 dark:bg-zinc-900 dark:ring-white/8"
                  >
                    <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                      {stat.label}
                    </p>
                    <motion.p
                      initial={
                        reduceMotion
                          ? false
                          : { opacity: 0, y: 8 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : {
                              delay: 0.34 + i * 0.09,
                              duration: 0.35,
                              ease: easeOut,
                            }
                      }
                      className="mt-1 text-[16px] font-bold tabular-nums text-slate-900 dark:text-slate-50"
                    >
                      {stat.value}
                    </motion.p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
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
