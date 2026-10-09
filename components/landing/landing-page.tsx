"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { HeroStageCanvas } from "@/components/landing/hero-stage-canvas";
import { LandingNav } from "@/components/landing/landing-nav";
import type { BrowseItem } from "@/lib/browse/items";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;
const CLI = "npx farsiui@latest add @tarhak/animated-tabs";

function CopyChip({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      dir="ltr"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        } catch {
          /* ignore */
        }
      }}
      className="group relative flex w-full max-w-full items-center gap-2 overflow-hidden rounded-2xl bg-black/45 px-3.5 py-3 text-start ring-1 ring-white/12 backdrop-blur-md transition-[background-color,box-shadow] duration-200 hover:bg-black/55 hover:ring-white/18 active:scale-[0.99] sm:px-4"
      aria-label="کپی دستور نصب"
    >
      <span
        aria-hidden
        className="size-2 shrink-0 rounded-full bg-white/35"
      />
      <code className="min-w-0 flex-1 truncate font-[family-name:var(--font-geist-mono),ui-monospace,monospace] text-[12px] leading-none text-white/75 sm:text-[13px]">
        {text}
      </code>
      <span
        aria-hidden
        className="inline-flex size-4 shrink-0 text-white/55 transition-colors group-hover:text-white/80"
      >
        {copied ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M3.5 8.5 6.5 11.5 12.5 4.5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect
              x="5.5"
              y="5.5"
              width="7"
              height="7"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path
              d="M10.5 5.5V4A1.5 1.5 0 0 0 9 2.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        )}
      </span>
    </button>
  );
}

function HeroCopy({ reduce }: { reduce: boolean }) {
  return (
    <div className="flex w-full flex-col items-center md:items-start">
      <motion.h1
        initial={reduce ? false : { opacity: 0, y: 18, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={reduce ? { duration: 0 } : { duration: 0.75, ease }}
        className="text-[clamp(2.8rem,12vw,4.75rem)] font-black leading-[0.92] text-white md:text-[clamp(2.6rem,5.5vw,4.25rem)]"
      >
        طرحک
      </motion.h1>

      <motion.p
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduce ? { duration: 0 } : { duration: 0.65, ease, delay: 0.16 }
        }
        className="mt-4 max-w-[20rem] text-center text-[14px] leading-7 text-white/55 sm:max-w-[24rem] sm:text-[15px] sm:leading-8 md:text-start"
      >
        کامپوننت‌هایی که قبل از کپی، حس محصول را نشان می‌دهند
        <br />
        نه اسکرین‌شات تخت
      </motion.p>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduce ? { duration: 0 } : { duration: 0.65, ease, delay: 0.26 }
        }
        className="mt-7 flex w-full max-w-sm flex-col items-center gap-3 sm:max-w-md md:items-start"
      >
        <Link
          href="/browse"
          className={cn(
            "landing-cta-glass group relative inline-flex h-[3.15rem] min-w-[13.5rem] items-center justify-center gap-2.5 overflow-hidden rounded-full px-8",
            "text-[15px] font-medium leading-none tracking-normal text-white",
            "transition-[transform,box-shadow] duration-300 ease-out",
            "hover:shadow-[0_1px_0_rgba(255,255,255,0.28)_inset,0_12px_32px_-12px_rgba(0,0,0,0.55)]",
            "active:scale-[0.98]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
          )}
        >
          <span
            aria-hidden
            className="landing-cta-sheen pointer-events-none absolute inset-0"
          />
          <span className="relative">ورود به مخزن</span>
          <span
            aria-hidden
            className="relative inline-flex size-4 shrink-0 transition-transform duration-300 ease-out group-hover:-translate-x-1"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 3.5L5.5 8 10 12.5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </Link>
        <CopyChip text={CLI} />
      </motion.div>
    </div>
  );
}

function HeroSection({ heroItems }: { heroItems: BrowseItem[] }) {
  const reduce = useReducedMotion() ?? false;

  return (
    <section className="absolute inset-0 overflow-hidden">
      <div className="landing-hero-stage absolute inset-0">
        <Image
          src="/landing/hero-bg.png"
          alt=""
          fill
          priority
          className="object-cover opacity-[0.94] saturate-[0.88] contrast-[1.08]"
          sizes="100vw"
        />

        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute -start-[10%] top-[-20%] h-[72%] w-[72%] rounded-full bg-[radial-gradient(circle,rgba(130,155,255,0.26)_0%,transparent_68%)] blur-2xl",
            !reduce && "landing-hero-bloom-a",
          )}
        />
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute -end-[8%] bottom-[-15%] h-[58%] w-[58%] rounded-full bg-[radial-gradient(circle,rgba(255,170,120,0.16)_0%,transparent_70%)] blur-3xl",
            !reduce && "landing-hero-bloom-b",
          )}
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(85%_75%_at_18%_42%,rgba(10,12,18,0.1)_0%,rgba(8,9,14,0.48)_52%,rgba(6,7,10,0.82)_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(108deg,transparent_0%,transparent_38%,rgba(6,7,10,0.52)_66%,rgba(6,7,10,0.88)_100%)] max-md:bg-[linear-gradient(180deg,rgba(6,7,10,0.72)_0%,rgba(6,7,10,0.12)_38%,rgba(6,7,10,0.3)_100%)]"
        />

        <div
          aria-hidden
          className="landing-hero-grain pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
        />

        <HeroStageCanvas items={heroItems} />

        <div className="relative z-10 ml-auto flex h-full w-full items-start justify-center px-6 pt-[5.75rem] sm:px-10 sm:pt-[6.75rem] md:w-[min(100%,40%)] md:items-center md:justify-start md:px-10 md:pt-0 lg:w-[min(100%,38%)] lg:px-14 xl:px-16">
          <HeroCopy reduce={reduce} />
        </div>
      </div>
    </section>
  );
}

export default function LandingPage({
  heroItems,
  githubStars,
}: {
  heroItems: BrowseItem[];
  categoryCards?: unknown;
  githubStars?: number | null;
}) {
  useEffect(() => {
    const html = document.documentElement;
    const { body } = document;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyOverscroll = body.style.overscrollBehavior;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.overscrollBehavior = prevBodyOverscroll;
    };
  }, []);

  return (
    <main
      dir="rtl"
      lang="fa"
      className="fixed inset-0 overflow-hidden bg-[#0c0d12] font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal text-white"
    >
      <HeroSection heroItems={heroItems} />
      <LandingNav githubStars={githubStars} tone="dark" overlay logoOnly />
    </main>
  );
}
