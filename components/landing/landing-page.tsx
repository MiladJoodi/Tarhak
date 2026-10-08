"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { type BrowseItem } from "@/lib/browse/items";
import type { LandingCategoryCard } from "@/lib/landing/categories";
import { HeroSpotlightCanvas } from "@/components/landing/hero-spotlight-canvas";
import { LandingNav } from "@/components/landing/landing-nav";
import { cn } from "@/lib/utils";

const avatars = [
  "/landing/avatar-1.png",
  "/landing/avatar-2.png",
  "/landing/avatar-3.png",
  "/landing/avatar-4.png",
];

const tools = [
  { name: "React", src: "/landing/tool-react.png" },
  { name: "Next.js", src: "/landing/tool-next.png" },
  { name: "TypeScript", src: "/landing/tool-typescript.png" },
  { name: "Tailwind CSS", src: "/landing/tool-tailwind.png" },
  { name: "Motion", src: "/landing/tool-motion.png" },
  { name: "FarsiUI", src: "/landing/tool-farsiui.svg" },
] as const;

const toolCardShadow =
  "inset 0 0 0 1px #fff, 0 1px 3px rgba(102,102,102,0.1), 0 6px 6px rgba(102,102,102,0.09), 0 13px 8px rgba(102,102,102,0.05)";

const landingDotPattern = {
  backgroundColor: "#F5F3EE",
  backgroundImage: "radial-gradient(circle, #EDEAE3 3.5px, transparent 3.5px)",
  backgroundSize: "28px 28px",
} as const;

/** Figma 91:4500 — stacked drop, 1px rim, top inset highlight. */
const buttonCraft = {
  primary: {
    className:
      "relative bg-[#3351e5] text-white after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[inset_0_1px_0_0.2px_rgba(255,255,255,0.16)] hover:brightness-110",
    style: {
      backgroundImage: "none",
      boxShadow: [
        "0px 2px 2px -1px rgba(0,0,0,0.16)",
        "0px 4px 4px -2px rgba(0,0,0,0.24)",
        "0px 0px 0px 1px rgba(0,0,0,0.12)",
      ].join(", "),
    },
  },
  secondary: {
    className:
      "dark relative overflow-hidden bg-secondary text-secondary-foreground after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.05)] hover:brightness-110",
    style: {
      backgroundImage: "none",
      boxShadow: [
        "0px 2px 2px -1px rgba(0,0,0,0.16)",
        "0px 4px 4px -2px rgba(0,0,0,0.24)",
        "0px 0px 0px 1px rgba(0,0,0,0.1)",
      ].join(", "),
    },
  },
  outline: {
    className: "bg-transparent text-[#071A31] hover:bg-[#071A31]/[0.04]",
    style: {
      backgroundImage: "none",
      boxShadow: [
        "inset 0 1px 0 rgba(255,255,255,0.7)",
        "inset 0 0 0 1.5px rgba(7,26,49,0.2)",
        "0 1px 2px rgba(7,26,49,0.04)",
      ].join(", "),
    },
  },
} as const;

function LandingButton({
  children,
  className,
  href = "/browse",
  variant = "primary",
}: {
  children: ReactNode;
  className?: string;
  href?: string;
  variant?: keyof typeof buttonCraft;
}) {
  const craft = buttonCraft[variant];
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-xl px-3.5 text-[15px] font-medium transition-[transform,filter,background-color] duration-150 ease-out active:scale-[0.96]",
        craft.className,
        className,
      )}
      style={craft.style}
    >
      {children}
    </Link>
  );
}

function ExploreButton({
  className,
  href = "/browse",
  variant = "primary",
}: {
  className?: string;
  href?: string;
  variant?: keyof typeof buttonCraft;
}) {
  return (
    <LandingButton
      className={cn("h-12 px-5 text-[16px]", className)}
      href={href}
      variant={variant}
    >
      Explore Components
    </LandingButton>
  );
}

function TrustedBy() {
  const reduce = useReducedMotion() ?? false;
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % avatars.length), 5000);
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <div className="mt-auto hidden items-center gap-3 pb-1 md:flex">
      <div className="flex">
        {avatars.map((src, i) => (
          <div key={src} className={cn("relative", i > 0 && "-ml-3")}>
            {i === active && !reduce ? (
              <motion.span
                layoutId="trusted-ring"
                className="absolute -inset-1 rounded-full ring-2 ring-white/90"
                transition={{ type: "spring", stiffness: 500, damping: 32 }}
              />
            ) : null}
            <Image
              src={src}
              alt=""
              width={45}
              height={45}
              className="relative size-[45px] rounded-full object-cover ring-2 ring-white"
            />
          </div>
        ))}
      </div>
      <p className="font-[family-name:var(--font-geist-mono)] text-[16px] leading-tight tracking-[-0.03em] text-white">
        Trusted by 100+
        <br />
        Developers
      </p>
    </div>
  );
}

function HeroSection({ heroItems }: { heroItems: BrowseItem[] }) {
  return (
    <section className="px-4 pb-3 sm:px-4 lg:px-4">
      <div className="relative h-[min(68svh,640px)] min-h-[420px] overflow-hidden rounded-[10px] bg-white">
        <Image
          src="/landing/hero-bg.png"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <HeroSpotlightCanvas items={heroItems} />

        <div className="relative z-10 flex h-full max-w-[440px] flex-col gap-5 p-6 pb-[min(48%,260px)] sm:gap-6 sm:p-9 sm:pb-9 md:pb-10 lg:p-11">
          <div className="flex flex-col gap-5 sm:gap-6">
            <div className="flex flex-col gap-3">
              <a
                href="https://vercel.com/oss"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit rounded-md bg-white px-2.5 py-1.5 transition-opacity hover:opacity-90"
              >
                <img
                  alt="Vercel OSS Program"
                  src="https://vercel.com/oss/program-badge-2026.svg"
                  className="h-5 w-auto brightness-0"
                />
              </a>
              <h1 className="text-balance text-[34px] leading-[1.15] tracking-[-0.04em] text-white sm:text-[46px]">
                Build interfaces that feel as good as they look.
              </h1>
              <p className="text-pretty text-[15px] leading-relaxed text-white/85">
                Beautiful, interactive React components built to help you ship
                polished interfaces without building every interaction from
                scratch.
              </p>
            </div>

            <ExploreButton className="w-fit" />
          </div>

          <TrustedBy />
        </div>
      </div>
    </section>
  );
}

function CategoryCardPreview({
  poster,
  video,
}: {
  poster: string;
  video?: string;
}) {
  const [ready, setReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const start = () => setReady(true);
    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(start, { timeout: 1500 });
      return () => cancelIdleCallback(id);
    }
    const t = window.setTimeout(start, 300);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const node = videoRef.current;
    if (!node || !ready || !video) return;
    void node.play().catch(() => {});
  }, [ready, video]);

  return (
    <>
      <Image
        src={poster}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 400px"
        className="object-cover"
      />
      {ready && video ? (
        <video
          ref={videoRef}
          src={video}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 size-full object-cover"
        />
      ) : null}
    </>
  );
}

function FeaturesSection({ cards }: { cards: LandingCategoryCard[] }) {
  return (
    <section className="bg-[#F5F3EE] px-4 py-10 sm:px-8 lg:px-[120px] lg:py-12">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 lg:gap-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-[28rem] text-[28px] leading-[1.15] tracking-[-0.04em] text-[#071A31] sm:text-[36px]">
            Everything you need to build the interface.
          </h2>
          <LandingButton href="/browse" variant="secondary" className="shrink-0">
            Explore full library
          </LandingButton>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          {cards.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#E2E2E2]/80 bg-transparent transition-[border-color] duration-150 hover:border-[#071A31]/20"
            >
              <div
                className="relative aspect-[16/10] overflow-hidden rounded-2xl"
                style={{ backgroundColor: cat.panel }}
              >
                <CategoryCardPreview poster={cat.poster} video={cat.video} />
              </div>
              <div className="flex items-center gap-2.5 px-1 pt-3 pb-1">
                <span
                  className="inline-flex items-center justify-center rounded-full px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[12px] font-medium leading-4 tracking-[-0.03em] text-white"
                  style={{
                    backgroundColor: cat.panel,
                    backgroundImage: cat.badgeGradient,
                  }}
                >
                  {cat.countLabel}
                </span>
                <h3 className="text-[17px] font-medium leading-6 tracking-[-0.02em] text-[#071A31]">
                  {cat.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ToolsSection() {
  return (
    <section
      id="tools"
      className="relative w-full px-4 py-10 sm:px-8 lg:px-[120px] lg:py-12"
      style={landingDotPattern}
    >
      <div className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-6">
        <div className="flex w-full max-w-[360px] flex-col items-center gap-2 text-center">
          <h2 className="text-balance text-[26px] leading-[1.2] tracking-[-0.04em] text-[#071A31] sm:text-[32px]">
            Fits right into the way you build.
          </h2>
          <p className="max-w-[280px] text-[14px] leading-[1.5] text-[#4B565E]">
            Works with the tools you already know.
          </p>
        </div>

        <ul className="flex w-full flex-wrap items-center justify-center gap-2.5">
          {tools.map((tool) => (
            <li
              key={tool.name}
              className="relative flex size-[56px] items-center justify-center overflow-hidden rounded-[10px] bg-[#F9F8F6] sm:size-[64px]"
              style={{ boxShadow: toolCardShadow }}
              title={tool.name}
            >
              <Image
                src={tool.src}
                alt={tool.name}
                width={40}
                height={40}
                unoptimized={tool.src.endsWith(".svg")}
                className="size-9 object-contain sm:size-10"
              />
            </li>
          ))}
        </ul>

        <ExploreButton className="h-10 w-fit px-4 text-[15px]" />
      </div>
    </section>
  );
}

export default function LandingPage({
  heroItems,
  categoryCards,
  githubStars,
}: {
  heroItems: BrowseItem[];
  categoryCards: LandingCategoryCard[];
  githubStars?: number | null;
}) {
  return (
    <main className="min-h-screen bg-[#F5F3EE] font-[family-name:var(--font-geist-sans)] text-[#071A31]">
      <LandingNav githubStars={githubStars} />
      <HeroSection heroItems={heroItems} />
      <FeaturesSection cards={categoryCards} />
      <ToolsSection />
    </main>
  );
}
