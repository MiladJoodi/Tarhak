"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { type BrowseItem } from "@/lib/browse/items";
import { HeroSpotlightCanvas } from "@/components/landing/hero-spotlight-canvas";
import { LandingNav } from "@/components/landing/landing-nav";
import { cn } from "@/lib/utils";

function ExploreButton({
  className,
  href = "/browse",
}: {
  className?: string;
  href?: string;
}) {
  const reduce = useReducedMotion() ?? false;

  return (
    <motion.div
      className={cn("relative mx-auto w-fit md:mx-0", className)}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduce
          ? { duration: 0 }
          : { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.18 }
      }
    >
      <Link
        href={href}
        className={cn(
          "landing-cta-glass group relative inline-flex h-12 min-w-[12.75rem] items-center justify-center gap-2 overflow-hidden rounded-full px-7",
          "text-[15px] font-medium leading-none tracking-normal text-white",
          "transition-transform duration-200 ease-out active:scale-[0.985]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        )}
      >
        <span>مشاهده کامپوننت‌ها</span>
        <span
          aria-hidden
          className="inline-flex size-4 shrink-0 transition-transform duration-300 ease-out group-hover:-translate-x-1"
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
    </motion.div>
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
          className="object-cover opacity-[0.92] saturate-[0.85] contrast-[1.08]"
          sizes="100vw"
        />

        {/* Depth blooms */}
        <div
          aria-hidden
          className="pointer-events-none absolute -start-[10%] top-[-20%] h-[70%] w-[70%] rounded-full bg-[radial-gradient(circle,rgba(120,150,255,0.22)_0%,transparent_68%)] blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -end-[8%] bottom-[-15%] h-[55%] w-[55%] rounded-full bg-[radial-gradient(circle,rgba(255,170,120,0.14)_0%,transparent_70%)] blur-3xl"
        />

        {/* Readability veil — stronger on copy side */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(85%_75%_at_18%_42%,rgba(10,12,18,0.12)_0%,rgba(8,9,14,0.45)_52%,rgba(6,7,10,0.78)_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(108deg,transparent_0%,transparent_40%,rgba(6,7,10,0.5)_66%,rgba(6,7,10,0.82)_100%)] max-md:bg-[linear-gradient(180deg,rgba(6,7,10,0.62)_0%,rgba(6,7,10,0.1)_36%,rgba(6,7,10,0.28)_100%)]"
        />

        <HeroSpotlightCanvas items={heroItems} />

        <div className="relative z-10 ml-auto flex h-full w-full max-w-[min(100%,30rem)] flex-col items-center justify-start px-6 pt-[5.75rem] text-center sm:px-10 sm:pt-[6.5rem] md:items-start md:justify-center md:pb-12 md:pt-16 md:text-start lg:max-w-[32rem] lg:px-14">
          <div className="flex w-full flex-col items-center gap-7 md:items-start md:gap-8">
            <motion.div
              className="flex flex-col items-center gap-4 md:items-start md:gap-5"
              initial={reduce ? false : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
              }
            >
              <h1 className="whitespace-nowrap text-[clamp(1.05rem,3.2vw,2.15rem)] font-semibold leading-none tracking-normal text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)]">
                از طراحی آماده تا محصول واقعی
              </h1>
              <p className="whitespace-nowrap text-[13px] leading-none text-white/78 sm:text-[15px]">
                با یک دستور شروع کن، با سبک خودت ادامه بده
              </p>
            </motion.div>

            <ExploreButton />
          </div>
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
  return (
    <main
      dir="rtl"
      lang="fa"
      className="relative h-svh max-h-svh overflow-hidden bg-[#0c0d12] font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal text-white"
    >
      <HeroSection heroItems={heroItems} />
      <LandingNav githubStars={githubStars} tone="dark" overlay />
    </main>
  );
}
