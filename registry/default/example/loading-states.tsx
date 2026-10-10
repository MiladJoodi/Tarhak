"use client";
// Adapted from beui.dev/components/agents/loading-states
// Visual language aligned with filter-interaction (Estedad, text-base, radius 20).

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Motion + shimmer tokens (inlined)                                          */
/* -------------------------------------------------------------------------- */

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
const SPRING_SWAP = {
  type: "spring" as const,
  stiffness: 460,
  damping: 30,
  mass: 0.55,
};

const TEXT_SHIMMER_KEYFRAMES =
  "@keyframes tarhak-text-shimmer{from{background-position:200% 0}to{background-position:-200% 0}}" +
  "@media (prefers-reduced-motion: reduce){.tarhak-text-shimmer{animation:none !important}}";

const TEXT_SHIMMER_CLASS_NAME =
  "tarhak-text-shimmer bg-[length:200%_100%] bg-clip-text text-transparent bg-[linear-gradient(110deg,var(--muted-foreground)_30%,var(--foreground)_50%,var(--muted-foreground)_70%)]";

function textShimmerStyle(duration: number): CSSProperties {
  return {
    animation: `tarhak-text-shimmer ${duration}s linear infinite`,
  };
}

function faNum(n: number | string) {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

/* -------------------------------------------------------------------------- */
/* Ascii line loader (minimal — only what ReasoningText needs)                */
/* -------------------------------------------------------------------------- */

const ASCII_LINE_FRAMES = ["|", "/", "-", "\\"];

function AsciiLineLoader({
  size = 14,
  speed = 0.8,
  label = "در حال استدلال",
}: {
  size?: number;
  speed?: number;
  label?: string;
}) {
  const reduce = useReducedMotion() ?? false;
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const step = ((reduce ? speed * 2.5 : speed) / ASCII_LINE_FRAMES.length) * 1000;
    const id = window.setInterval(
      () => setFrame((f) => (f + 1) % ASCII_LINE_FRAMES.length),
      step,
    );
    return () => window.clearInterval(id);
  }, [speed, reduce]);

  return (
    <span
      role="status"
      aria-label={label}
      className="inline-flex items-center justify-center font-mono leading-none tabular-nums text-foreground"
      style={{ fontSize: size, lineHeight: 1 }}
    >
      <span aria-hidden="true">{ASCII_LINE_FRAMES[frame]}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Text scramble                                                              */
/* -------------------------------------------------------------------------- */

const SCRAMBLE_GLYPHS =
  "ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهیABCDEFGHJKLMNPQRSTUVWXYZ۰۱۲۳۴۵۶۷۸۹#%&@$?/";

export interface TextScrambleProps {
  text: string;
  duration?: number;
  glyphs?: string;
  className?: string;
  style?: CSSProperties;
}

export function TextScramble({
  text,
  duration,
  glyphs = SCRAMBLE_GLYPHS,
  className,
  style,
}: TextScrambleProps) {
  const reduce = useReducedMotion() ?? false;
  const [display, setDisplay] = useState(text);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      setDisplay(text);
      return;
    }

    if (reduce || !glyphs) {
      setDisplay(text);
      return;
    }

    const characters = text.split("");
    const startedAt = performance.now();
    const animationDuration =
      duration ?? Math.min(760, Math.max(420, characters.length * 32));
    let frame = 0;
    let lastUpdate = 0;

    const tick = (now: number) => {
      if (now - lastUpdate >= 40) {
        lastUpdate = now;
        const progress = Math.min((now - startedAt) / animationDuration, 1);
        const settled = Math.floor(progress * characters.length);
        setDisplay(
          characters
            .map((character, index) => {
              if (index < settled || character === " " || character === "…") {
                return character;
              }
              return glyphs[Math.floor(Math.random() * glyphs.length)];
            })
            .join(""),
        );
      }

      if (now - startedAt < animationDuration) {
        frame = requestAnimationFrame(tick);
      } else {
        setDisplay(text);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, glyphs, reduce, text]);

  return (
    <span className={cn("inline-block whitespace-pre", className)} style={style}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{reduce ? text : display}</span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Text shimmer                                                               */
/* -------------------------------------------------------------------------- */

export interface TextShimmerProps {
  children: ReactNode;
  as?: ElementType;
  duration?: number;
  className?: string;
}

export function TextShimmer({
  children,
  as: Comp = "span",
  duration = 2.5,
  className,
}: TextShimmerProps) {
  return (
    <>
      <style>{TEXT_SHIMMER_KEYFRAMES}</style>
      <Comp
        style={textShimmerStyle(duration)}
        className={cn("inline-block", TEXT_SHIMMER_CLASS_NAME, className)}
      >
        {children}
      </Comp>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Thinking shimmer                                                           */
/* -------------------------------------------------------------------------- */

export interface ThinkingShimmerProps {
  children?: ReactNode;
  duration?: number;
  className?: string;
}

export function ThinkingShimmer({
  children = "در حال فکر…",
  duration = 1.8,
  className,
}: ThinkingShimmerProps) {
  return (
    <TextShimmer as="span" duration={duration} className={cn(className)}>
      {children}
    </TextShimmer>
  );
}

/* -------------------------------------------------------------------------- */
/* Reasoning text                                                             */
/* -------------------------------------------------------------------------- */

const DEFAULT_PHRASES = [
  "در حال فکر",
  "خواندن زمینه",
  "وصل کردن جزئیات",
  "شکل‌دادن پاسخ",
];

/** Word-level stagger — letter-level breaks Persian joining. */
const CASCADE_STAGGER = 0.055;

export type ReasoningTextVariant = "cascade" | "swap" | "scramble";

export interface ReasoningTextProps {
  phrases?: string[];
  variant?: ReasoningTextVariant;
  interval?: number;
  shimmerDuration?: number;
  indicator?: ReactNode;
  className?: string;
}

type PhraseProps = {
  phrase: string;
  reduce: boolean;
  shimmerDuration: number;
};

function CascadePhrase({ phrase, reduce, shimmerDuration }: PhraseProps) {
  const text = `${phrase}…`;
  // Cascade by word so Arabic/Persian letters stay connected inside each span.
  const units = text.split(/(\s+)/).filter((part) => part.length > 0);

  if (reduce) {
    return (
      <span
        className={cn(
          "col-start-1 row-start-1 inline-block justify-self-start whitespace-pre",
          TEXT_SHIMMER_CLASS_NAME,
        )}
        style={textShimmerStyle(shimmerDuration)}
      >
        {text}
      </span>
    );
  }

  return (
    <AnimatePresence initial={false}>
      <motion.span
        key={phrase}
        className="col-start-1 row-start-1 inline-flex justify-self-start whitespace-pre"
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {units.map((unit, unitIndex) => (
          <motion.span
            key={`${unitIndex}-${unit}`}
            custom={unitIndex * CASCADE_STAGGER}
            variants={{
              initial: { opacity: 0, y: "100%" },
              animate: (delay: number) => ({
                opacity: 1,
                y: "0%",
                transition: { ...SPRING_SWAP, delay },
              }),
              exit: (delay: number) => ({
                opacity: 0,
                y: "-100%",
                transition: {
                  duration: 0.14,
                  ease: EASE_OUT,
                  delay: delay * 0.45,
                },
              }),
            }}
            className={cn(
              "inline-block whitespace-pre will-change-[opacity,transform]",
              TEXT_SHIMMER_CLASS_NAME,
            )}
            style={textShimmerStyle(shimmerDuration)}
          >
            {unit}
          </motion.span>
        ))}
      </motion.span>
    </AnimatePresence>
  );
}

function SwapPhrase({ phrase, reduce, shimmerDuration }: PhraseProps) {
  return (
    <AnimatePresence initial={false}>
      <motion.span
        key={phrase}
        className={cn(
          "col-start-1 row-start-1 inline-block justify-self-start whitespace-nowrap will-change-[opacity,transform]",
          TEXT_SHIMMER_CLASS_NAME,
        )}
        style={textShimmerStyle(shimmerDuration)}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 3 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: -3 }}
        transition={{
          duration: reduce ? 0.12 : 0.2,
          ease: EASE_OUT,
        }}
      >
        {phrase}…
      </motion.span>
    </AnimatePresence>
  );
}

function ScramblePhrase({ phrase, shimmerDuration }: PhraseProps) {
  const target = `${phrase}…`;

  return (
    <TextScramble
      text={target}
      className={cn(
        "col-start-1 row-start-1 justify-self-start tabular-nums",
        TEXT_SHIMMER_CLASS_NAME,
      )}
      style={textShimmerStyle(shimmerDuration)}
    />
  );
}

export function ReasoningText({
  phrases = DEFAULT_PHRASES,
  variant = "cascade",
  interval = 1800,
  shimmerDuration = 2.2,
  indicator,
  className,
}: ReasoningTextProps) {
  const reduce = useReducedMotion() ?? false;
  const [index, setIndex] = useState(0);
  const statusId = useId();
  const safePhrases = phrases.length > 0 ? phrases : DEFAULT_PHRASES;
  const phrase = safePhrases[index % safePhrases.length];
  const longestPhrase = safePhrases.reduce((longest, current) =>
    current.length > longest.length ? current : longest,
  );
  const phraseProps = { phrase, reduce, shimmerDuration };

  useEffect(() => {
    if (safePhrases.length < 2) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % safePhrases.length);
    }, Math.max(600, interval));

    return () => window.clearInterval(timer);
  }, [interval, safePhrases.length]);

  return (
    <>
      <style>{TEXT_SHIMMER_KEYFRAMES}</style>
      <span
        role="status"
        aria-live="polite"
        aria-labelledby={statusId}
        className={cn(
          "inline-flex items-center gap-2 text-base text-muted-foreground",
          className,
        )}
      >
        <span
          aria-hidden="true"
          className="inline-flex size-3 shrink-0 items-center justify-center"
        >
          {indicator ?? (
            <AsciiLineLoader size={14} speed={0.8} label="در حال استدلال" />
          )}
        </span>

        <span aria-hidden="true" className="grid overflow-hidden text-start">
          <span className="invisible col-start-1 row-start-1 whitespace-nowrap">
            {longestPhrase}…
          </span>
          {variant === "cascade" ? (
            <CascadePhrase {...phraseProps} />
          ) : variant === "scramble" ? (
            <ScramblePhrase {...phraseProps} />
          ) : (
            <SwapPhrase {...phraseProps} />
          )}
        </span>

        <span id={statusId} className="sr-only">
          {phrase}
        </span>
      </span>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Agent progress                                                             */
/* -------------------------------------------------------------------------- */

const GRID_CELLS = [
  { id: "top-left", delay: 0 },
  { id: "top-center", delay: 0.14 },
  { id: "top-right", delay: 0.28 },
  { id: "middle-left", delay: 0.42 },
  { id: "middle-center", delay: 0.56 },
  { id: "middle-right", delay: 0.7 },
  { id: "bottom-left", delay: 0.84 },
  { id: "bottom-center", delay: 0.98 },
  { id: "bottom-right", delay: 1.12 },
];

export interface AgentProgressProps {
  label?: string;
  elapsedSeconds?: number;
  initialSeconds?: number;
  running?: boolean;
  className?: string;
}

function formatElapsed(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = (safeSeconds % 60).toFixed(1);
  if (minutes > 0) {
    return `${faNum(minutes)}م ${faNum(seconds)}ث`;
  }
  return `${faNum(seconds)}ث`;
}

export function AgentProgress({
  label = "در حال پردازش",
  elapsedSeconds,
  initialSeconds = 0,
  running = true,
  className,
}: AgentProgressProps) {
  const reduce = useReducedMotion() ?? false;
  const [internalSeconds, setInternalSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (elapsedSeconds !== undefined || !running) return;

    const startedAt = performance.now() - initialSeconds * 1000;
    const timer = window.setInterval(() => {
      setInternalSeconds((performance.now() - startedAt) / 1000);
    }, 100);

    return () => window.clearInterval(timer);
  }, [elapsedSeconds, initialSeconds, running]);

  const elapsed = elapsedSeconds ?? internalSeconds;

  return (
    <span
      role="status"
      aria-label={`${label}، در حال انجام`}
      className={cn(
        "inline-flex items-center gap-3 text-base text-muted-foreground",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="grid size-5 shrink-0 grid-cols-3 gap-0.5"
      >
        {GRID_CELLS.map(({ id, delay }) => (
          <motion.span
            key={id}
            className="rounded-sm bg-current"
            animate={
              reduce
                ? { opacity: [0.35, 0.8, 0.35] }
                : {
                    opacity: [0.28, 1, 0.28],
                    scale: [0.72, 1, 0.72],
                  }
            }
            transition={{
              duration: 1.55,
              ease: EASE_IN_OUT,
              repeat: Infinity,
              delay,
            }}
          />
        ))}
      </span>
      <span>{label}</span>
      <span
        aria-hidden="true"
        className="tabular-nums text-muted-foreground/70"
        dir="ltr"
      >
        {formatElapsed(elapsed)}
      </span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Demo                                                                       */
/* -------------------------------------------------------------------------- */

const REASONING_PHRASES = [
  "در حال فکر",
  "خواندن درخواست",
  "بررسی جزئیات",
  "آماده‌سازی پاسخ",
];

const SCRAMBLE_PHRASES = ["در حال فکر", "جستجو", "استدلال", "نوشتن"];

const EXAMPLES: {
  label: string;
  variant: ReasoningTextVariant;
  phrases: string[];
}[] = [
  { label: "آبشاری", variant: "cascade", phrases: REASONING_PHRASES },
  { label: "جابه‌جایی", variant: "swap", phrases: REASONING_PHRASES },
  { label: "درهم‌ریخته", variant: "scramble", phrases: SCRAMBLE_PHRASES },
];

/** پیش‌نمایش فارسی — سه حالت بارگذاری ایجنت. */
export default function LoadingStatesExample() {
  return (
    <section
      dir="rtl"
      lang="fa"
      className="relative flex w-full items-center justify-center fill-muted-foreground/70 bg-transparent px-4 py-10 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <div
        className="w-full max-w-sm overflow-hidden border border-border bg-card px-1 py-1 text-foreground"
        style={{ borderRadius: 20 }}
      >
        <div className="flex flex-col gap-1">
          <div className="rounded-2xl px-3 py-3">
            <p className="mb-2 text-sm text-muted-foreground">درخشش فکر</p>
            <ThinkingShimmer className="text-base" duration={1.8}>
              در حال فکر…
            </ThinkingShimmer>
          </div>

          <div className="rounded-2xl px-3 py-3">
            <p className="mb-2 text-sm text-muted-foreground">پیشرفت ایجنت</p>
            <AgentProgress
              label="در حال پردازش"
              initialSeconds={151.6}
              className="text-base"
            />
          </div>

          {EXAMPLES.map(({ label, variant, phrases }) => (
            <div key={variant} className="rounded-2xl px-3 py-3">
              <p className="mb-2 text-sm text-muted-foreground">{label}</p>
              <ReasoningText
                variant={variant}
                phrases={phrases}
                className="text-base"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
