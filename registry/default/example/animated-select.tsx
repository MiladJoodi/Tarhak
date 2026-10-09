"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentType,
} from "react";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useReducedMotion,
} from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  GlobalIcon,
  LanguageCircleIcon,
  Location01Icon,
  Moon02Icon,
  PaintBoardIcon,
  Sun03Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import clsx from "clsx";

const ON_GREEN = "#34C759";

const panelSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 32,
  mass: 0.75,
};

const rowSpring = {
  type: "spring" as const,
  stiffness: 480,
  damping: 28,
  mass: 0.65,
};

const ROW_EASE: [number, number, number, number] = [0.215, 0.61, 0.355, 1];

export type SelectOption = {
  value: string;
  label: string;
  description?: string;
  icon?: ComponentType<Record<string, unknown>>;
};

type SoftSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  "aria-label"?: string;
};

/** Animated select — trigger morphs, list springs, tick draws, highlight slides. */
export function SoftSelect({
  value,
  onValueChange,
  options,
  placeholder = "انتخاب کنید",
  label,
  "aria-label": ariaLabel,
}: SoftSelectProps) {
  const reduce = useReducedMotion() ?? false;
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const highlightId = useId().replace(/:/g, "");

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(next: string) {
    onValueChange(next);
    window.setTimeout(() => setOpen(false), 140);
  }

  return (
    <div ref={rootRef} className="relative w-full">
      {label ? (
        <p className="mb-2 text-sm text-muted-foreground">{label}</p>
      ) : null}

      <motion.button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel ?? label ?? placeholder}
        onClick={() => setOpen((v) => !v)}
        whileTap={reduce ? undefined : { scale: 0.985 }}
        className={clsx(
          "relative flex w-full cursor-pointer items-center gap-3 overflow-hidden border border-border bg-card px-3.5 py-3 text-start outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring",
          open && "border-foreground/20",
        )}
        style={{ borderRadius: 16, borderWidth: 1 }}
      >
        {selected?.icon ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground">
            <HugeiconsIcon icon={selected.icon} size={20} />
          </span>
        ) : null}

        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={selected?.value ?? "empty"}
              initial={
                reduce
                  ? false
                  : { opacity: 0, y: 6, filter: "blur(3px)" }
              }
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={
                reduce
                  ? undefined
                  : { opacity: 0, y: -6, filter: "blur(3px)" }
              }
              transition={reduce ? { duration: 0.1 } : rowSpring}
              className={clsx(
                "block truncate text-base font-medium",
                selected ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {selected?.label ?? placeholder}
            </motion.span>
          </AnimatePresence>
        </div>

        <motion.span
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground"
          animate={{ rotate: open ? 180 : 0 }}
          transition={reduce ? { duration: 0.12 } : panelSpring}
        >
          <HugeiconsIcon icon={ArrowDown01Icon} size={18} />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={listId}
            role="listbox"
            aria-label={ariaLabel ?? label ?? placeholder}
            initial={
              reduce
                ? { opacity: 1 }
                : { opacity: 0, y: -8, scale: 0.97, filter: "blur(4px)" }
            }
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, y: -6, scale: 0.98, filter: "blur(3px)" }
            }
            transition={reduce ? { duration: 0.12 } : panelSpring}
            className="absolute inset-x-0 top-[calc(100%+8px)] z-20 overflow-hidden border border-border bg-card shadow-[0_12px_40px_-18px_rgba(0,0,0,0.45)]"
            style={{ borderRadius: 18, borderWidth: 1 }}
            onMouseLeave={() => setHovered(null)}
          >
            <ul className="flex flex-col gap-0.5 p-1.5">
              {options.map((option, index) => {
                const active = option.value === value;
                const isHover = hovered === option.value;
                const showHighlight = isHover || (active && !hovered);

                return (
                  <motion.li
                    key={option.value}
                    role="option"
                    aria-selected={active}
                    initial={
                      reduce
                        ? false
                        : { opacity: 0, y: 14 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      ...(reduce ? { duration: 0.08 } : rowSpring),
                      delay: reduce ? 0 : 0.03 + index * 0.035,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => pick(option.value)}
                      onMouseEnter={() => setHovered(option.value)}
                      className={clsx(
                        "relative flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-start outline-none",
                        "focus-visible:ring-2 focus-visible:ring-ring",
                      )}
                    >
                      {showHighlight ? (
                        <motion.span
                          layoutId={`select-hl-${highlightId}`}
                          className="absolute inset-0 rounded-2xl bg-accent"
                          transition={
                            reduce ? { duration: 0.1 } : panelSpring
                          }
                        />
                      ) : null}

                      {option.icon ? (
                        <span className="relative z-1 flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground">
                          <HugeiconsIcon icon={option.icon} size={20} />
                        </span>
                      ) : null}

                      <div className="relative z-1 min-w-0 flex-1">
                        <p className="truncate text-base font-medium text-foreground">
                          {option.label}
                        </p>
                        {option.description ? (
                          <p className="truncate text-sm text-muted-foreground">
                            {option.description}
                          </p>
                        ) : null}
                      </div>

                      <span className="relative z-1 flex size-6 shrink-0 items-center justify-center">
                        <AnimatePresence initial={false}>
                          {active ? (
                            <motion.span
                              key="tick"
                              initial={
                                reduce
                                  ? false
                                  : { opacity: 0, scale: 0.4, rotate: -40 }
                              }
                              animate={{ opacity: 1, scale: 1, rotate: 0 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              transition={
                                reduce ? { duration: 0.1 } : rowSpring
                              }
                              className="flex size-6 items-center justify-center rounded-full"
                              style={{ backgroundColor: ON_GREEN }}
                            >
                              <HugeiconsIcon
                                icon={Tick02Icon}
                                size={14}
                                className="text-white"
                              />
                            </motion.span>
                          ) : null}
                        </AnimatePresence>
                      </span>
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

const LANGUAGE_OPTIONS: SelectOption[] = [
  {
    value: "fa",
    label: "فارسی",
    description: "راست‌چین و اعداد فارسی",
    icon: LanguageCircleIcon,
  },
  {
    value: "en",
    label: "English",
    description: "Left to right",
    icon: GlobalIcon,
  },
  {
    value: "ar",
    label: "العربية",
    description: "من اليمين إلى اليسار",
    icon: LanguageCircleIcon,
  },
];

const THEME_OPTIONS: SelectOption[] = [
  {
    value: "system",
    label: "سیستم",
    description: "هم‌قدم با دستگاه",
    icon: PaintBoardIcon,
  },
  {
    value: "light",
    label: "روشن",
    description: "پس‌زمینهٔ روشن",
    icon: Sun03Icon,
  },
  {
    value: "dark",
    label: "تیره",
    description: "پس‌زمینهٔ تیره",
    icon: Moon02Icon,
  },
];

const CITY_OPTIONS: SelectOption[] = [
  {
    value: "teh",
    label: "تهران",
    description: "پایتخت",
    icon: Location01Icon,
  },
  {
    value: "isf",
    label: "اصفهان",
    description: "نصف جهان",
    icon: Location01Icon,
  },
  {
    value: "shiraz",
    label: "شیراز",
    description: "شهر شعر",
    icon: Location01Icon,
  },
  {
    value: "mashhad",
    label: "مشهد",
    description: "خراسان",
    icon: Location01Icon,
  },
];

export default function AnimatedSelect() {
  const [language, setLanguage] = useState("fa");
  const [theme, setTheme] = useState("dark");
  const [city, setCity] = useState("teh");

  return (
    <section
      dir="rtl"
      lang="fa"
      aria-label="سلکت انیمیشنی"
      className="flex w-full max-w-[360px] flex-col gap-5 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <MotionConfig transition={{ ease: ROW_EASE }}>
        <div
          className="flex flex-col gap-4 border border-border bg-card p-4"
          style={{ borderRadius: 20, borderWidth: 1 }}
        >
          <SoftSelect
            label="زبان"
            value={language}
            onValueChange={setLanguage}
            options={LANGUAGE_OPTIONS}
          />
          <SoftSelect
            label="تم"
            value={theme}
            onValueChange={setTheme}
            options={THEME_OPTIONS}
          />
          <SoftSelect
            label="شهر"
            value={city}
            onValueChange={setCity}
            options={CITY_OPTIONS}
          />
        </div>
      </MotionConfig>
    </section>
  );
}
