"use client";

import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

const PAGE_SPRINGS = [
  {
    initial: { rotate: -3.5, x: -36, y: 4, scale: 0.98 },
    open: { rotate: -11, x: -78, y: -88, scale: 1 },
    transition: {
      type: "spring" as const,
      stiffness: 170,
      damping: 20,
      mass: 0.85,
    },
  },
  {
    initial: { rotate: 0.5, x: 0, y: 0, scale: 1 },
    open: { rotate: 1.5, x: 4, y: -108, scale: 1.02 },
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 22,
      mass: 0.8,
    },
  },
  {
    initial: { rotate: 4, x: 40, y: 3, scale: 0.98 },
    open: { rotate: 12, x: 82, y: -92, scale: 1 },
    transition: {
      type: "spring" as const,
      stiffness: 175,
      damping: 19,
      mass: 0.85,
    },
  },
] as const;

const PAGE_SNIPPETS = [
  { lines: [92, 78, 64], accent: "#c4a574" },
  { lines: [88, 70, 82, 55], accent: "#8fa89a" },
  { lines: [80, 86, 60], accent: "#b08a8a" },
];

function HeartMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 21s-6.2-4.35-9.05-8.2C1.1 10.4 1.35 6.9 3.9 5.1c2.1-1.5 4.85-1 6.35.85L12 7.7l1.75-1.75c1.5-1.85 4.25-2.35 6.35-.85 2.55 1.8 2.8 5.3.95 7.7C18.2 16.65 12 21 12 21z" />
    </svg>
  );
}

function QuotePage({
  index,
  open,
}: {
  index: number;
  open: boolean;
}) {
  const snippet = PAGE_SNIPPETS[index]!;
  const reduce = useReducedMotion() ?? false;

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-[14px] border p-3.5",
        "border-black/8 bg-gradient-to-b from-[#fffaf3] to-[#f3ebe0]",
        "shadow-[0_14px_28px_-14px_rgba(40,28,16,0.35)]",
        "dark:border-white/10 dark:from-[hsl(225_10%_16%)] dark:to-[hsl(225_10%_12%)]",
      )}
    >
      <div
        aria-hidden
        className="mb-3 flex items-center justify-between"
      >
        <span
          className="size-1.5 rounded-full"
          style={{ backgroundColor: snippet.accent }}
        />
        <span className="text-[9px] font-medium tracking-wide text-neutral-400 dark:text-neutral-500">
          یادداشت
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {snippet.lines.map((w, i) => (
          <motion.div
            key={i}
            className="h-1.5 rounded-full bg-neutral-900/10 dark:bg-white/12"
            style={{ width: `${w}%` }}
            animate={
              reduce
                ? undefined
                : open
                  ? { opacity: [0.45, 0.85, 0.55] }
                  : { opacity: 0.55 }
            }
            transition={{
              duration: 2.4,
              delay: i * 0.12,
              repeat: open ? Infinity : 0,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-multiply dark:opacity-[0.12] dark:mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}

export type EmptyTestimonialProps = {
  title?: string;
  highlight?: string;
  emptyLabel?: string;
  emptyHint?: string;
  className?: string;
  defaultOpen?: boolean;
};

export default function EmptyTestimonial({
  title = "دیوار",
  highlight = "محبت",
  emptyLabel = "هنوز نظری ثبت نشده",
  emptyHint = "اولین نقل‌قول اینجا می‌نشیند",
  className,
  defaultOpen = false,
}: EmptyTestimonialProps) {
  const reduce = useReducedMotion() ?? false;
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isHovered, setIsHovered] = useState(false);

  const toggle = () => setIsOpen((v) => !v);

  return (
    <div
      dir="rtl"
      lang="fa"
      className={cn(
        "relative flex w-full flex-col items-center justify-center px-4 py-16 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal sm:py-20",
        className,
      )}
    >
      {/* Soft stage */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-1/4 top-[42%] h-40 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(120,90,60,0.12),transparent_70%)] blur-2xl dark:bg-[radial-gradient(ellipse,rgba(255,255,255,0.06),transparent_70%)]"
      />

      <div className="relative mb-14 text-center sm:mb-16">
        <p className="mb-3 text-[11px] font-medium tracking-[0.16em] text-neutral-400 uppercase dark:text-neutral-500">
          خالی · منتظر صدا
        </p>
        <h2 className="text-3xl font-medium text-foreground md:text-4xl lg:text-[2.75rem]">
          {title}{" "}
          <motion.span
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className={cn(
              "relative inline-flex cursor-default items-center gap-2 rounded-2xl px-3.5 py-1",
              "border border-rose-500/15 bg-rose-500/[0.07] text-rose-700",
              "transition-colors duration-300",
              "hover:border-rose-500/25 hover:bg-rose-500/12",
              "dark:border-rose-300/20 dark:bg-rose-300/10 dark:text-rose-200",
            )}
          >
            {highlight}
            <motion.span
              animate={
                reduce
                  ? undefined
                  : isHovered
                    ? { scale: [1, 1.18, 1] }
                    : { scale: 1 }
              }
              transition={{
                duration: 0.7,
                repeat: isHovered && !reduce ? Infinity : 0,
                ease: "easeInOut",
              }}
              className="inline-flex text-rose-500 dark:text-rose-300"
            >
              <HeartMark className="size-5" />
            </motion.span>
          </motion.span>
        </h2>
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-label={isOpen ? "بستن پوشهٔ نظرات" : "باز کردن پوشهٔ نظرات"}
        className={cn(
          "group relative mb-10 h-56 w-[21rem] cursor-pointer border-0 bg-transparent p-0 sm:mb-12 sm:h-60 sm:w-[22.5rem]",
          "outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50 focus-visible:ring-offset-4 focus-visible:ring-offset-background",
        )}
      >
        {/* Folder back */}
        <div
          className={cn(
            "folder-back relative mx-auto flex h-full w-[88%] justify-center overflow-visible rounded-2xl",
            "border border-[#cfc4b4] bg-gradient-to-b from-[#ebe2d4] to-[#ddd1bd]",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]",
            "dark:border-zinc-600 dark:from-zinc-800 dark:to-zinc-900",
          )}
        >
          {/* Tab */}
          <div
            aria-hidden
            className={cn(
              "absolute -top-3 start-6 h-3 w-16 rounded-t-md",
              "bg-[#ddd1bd] dark:bg-zinc-700",
              "border border-b-0 border-[#cfc4b4] dark:border-zinc-600",
            )}
          />

          {PAGE_SPRINGS.map((page, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={isOpen ? page.open : page.initial}
              transition={reduce ? { duration: 0.15 } : page.transition}
              className={cn(
                "absolute top-3 h-[9.5rem] w-[8.25rem]",
                i === 1 ? "z-20" : "z-10",
              )}
            >
              <QuotePage index={i} open={isOpen} />
            </motion.div>
          ))}
        </div>

        {/* Folder front / lid */}
        <motion.div
          animate={{ rotateX: isOpen ? -38 : 0 }}
          transition={
            reduce
              ? { duration: 0.15 }
              : { type: "spring", stiffness: 220, damping: 22, mass: 0.75 }
          }
          className="absolute inset-x-0 -bottom-px z-30 flex h-48 origin-bottom items-center justify-center overflow-visible rounded-3xl sm:h-52"
          style={{
            transformStyle: "preserve-3d",
            perspective: 900,
            backfaceVisibility: "hidden",
          }}
        >
          <div className="relative h-full w-full [transform-style:preserve-3d]">
            {/* Inside of lid when open — avoids black backface in light mode */}
            <div
              aria-hidden
              className="absolute inset-x-[6%] bottom-[8%] top-[18%] rounded-2xl bg-[#e8dfd0] dark:bg-zinc-700"
              style={{
                transform: "rotateX(180deg) translateZ(1px)",
                backfaceVisibility: "hidden",
              }}
            />
            <svg
              className="relative h-full w-full overflow-visible"
              viewBox="0 0 235 121"
              fill="none"
              preserveAspectRatio="none"
              aria-hidden
              style={{ backfaceVisibility: "hidden" }}
            >
              <path
                d="M104.615 0.350494L33.1297 0.838776C32.7542 0.841362 32.3825 0.881463 32.032 0.918854C31.6754 0.956907 31.3392 0.992086 31.0057 0.992096H31.0047C30.6871 0.99235 30.3673 0.962051 30.0272 0.929596C29.6927 0.897686 29.3384 0.863802 28.9803 0.866119L13.2693 0.967682H13.2527L13.2352 0.969635C13.1239 0.981406 13.0121 0.986674 12.9002 0.986237H9.91388C8.33299 0.958599 6.76052 1.22345 5.27423 1.76651H5.27325C4.33579 2.11246 3.48761 2.66213 2.7879 3.37393L2.49689 3.68839L2.492 3.69424C1.62667 4.73882 1.00023 5.96217 0.656067 7.27725C0.653324 7.28773 0.654065 7.29886 0.652161 7.30948C0.3098 8.62705 0.257231 10.0048 0.499817 11.3446L12.2147 114.399L12.2156 114.411L12.2176 114.423C12.6046 116.568 13.7287 118.508 15.3934 119.902C17.058 121.297 19.1572 122.056 21.3231 122.049V122.05H215.379C217.76 122.02 220.064 121.192 221.926 119.698V119.697C223.657 118.384 224.857 116.485 225.305 114.35L225.307 114.339L235.914 53.3798L235.968 53.1093L235.97 53.0985L235.971 53.0888C236.134 51.8978 236.044 50.685 235.705 49.5321C235.307 48.1669 234.63 46.9005 233.717 45.8144L233.383 45.4296C232.58 44.5553 231.614 43.8449 230.539 43.3398C229.311 42.7628 227.971 42.4685 226.616 42.4774H146.746C144.063 42.4705 141.423 41.8004 139.056 40.5263C136.691 39.2522 134.671 37.4127 133.175 35.1689L113.548 5.05948L113.544 5.05362L113.539 5.04776C112.545 3.65165 111.238 2.51062 109.722 1.72061C108.266 0.886502 106.627 0.422235 104.952 0.365143V0.364166L104.633 0.350494H104.615Z"
                className="fill-[#f4efe6] stroke-[#cfc4b4] dark:fill-zinc-700 dark:stroke-zinc-500"
                strokeWidth="1.5"
              />
            </svg>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-10">
              <motion.div
                animate={isOpen ? { opacity: 0.35, y: 4 } : { opacity: 1, y: 0 }}
                className="flex flex-col items-center"
              >
                <div className="mb-2.5 flex gap-10">
                  <div className="size-2.5 rounded-full bg-neutral-500/35 dark:bg-neutral-300/30" />
                  <div className="size-2.5 rounded-full bg-neutral-500/35 dark:bg-neutral-300/30" />
                </div>
                <div className="h-1 w-10 rounded-full bg-neutral-500/35 dark:bg-neutral-300/30" />
                <p className="mt-4 text-[11px] font-medium text-neutral-500/80 dark:text-neutral-400/80">
                  {isOpen ? "برای بستن بزنید" : "برای باز کردن بزنید"}
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </button>

      <div className="relative text-center">
        <motion.p
          key={isOpen ? "open" : "closed"}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="text-lg text-foreground sm:text-xl"
        >
          {emptyLabel}
          <br />
          <span className="mt-1 inline-block text-base text-muted-foreground">
            {isOpen ? "جا برای حرف‌های قشنگ باز است" : emptyHint}
          </span>
        </motion.p>
      </div>
    </div>
  );
}
