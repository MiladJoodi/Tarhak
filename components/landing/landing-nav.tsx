"use client";

import Link from "next/link";
import { useState } from "react";

import { formatStarCount, GITHUB_URL } from "@/lib/github";
import { BrandLogo } from "@/components/brand-logo";
import { BrandStar } from "@/components/brand-star";
import { cn } from "@/lib/utils";

export const landingNavLinks = [
  { label: "کامپوننت‌ها", href: "/browse" },
  { label: "مستندات", href: "/docs" },
  { label: "تماس", href: "/contact" },
] as const;

function GithubMarkLink({
  stars,
  dark,
}: {
  stars?: number | null;
  dark?: boolean;
}) {
  const count = typeof stars === "number" ? formatStarCount(stars) : null;
  return (
    <a
      href={GITHUB_URL}
      target="_blank"
      rel="noreferrer"
      aria-label={
        count ? `Tarhak در گیت‌هاب، ${count} ستاره` : "Tarhak در گیت‌هاب"
      }
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-[background-color,border-color] duration-150",
        dark
          ? "border border-white/14 bg-white/8 text-white hover:border-white/22 hover:bg-white/12"
          : "border border-[#071A31]/12 bg-white/70 text-[#071A31] shadow-[0_1px_2px_rgba(7,26,49,0.04)] hover:border-[#071A31]/20 hover:bg-white",
      )}
    >
      <BrandStar className="text-[#C9A227]" />
      {count ? (
        <span dir="ltr" className="text-[13px] leading-none font-medium tabular-nums">
          {count}
        </span>
      ) : null}
    </a>
  );
}

export function LandingNav({
  githubStars,
  tone = "light",
  overlay = false,
  logoOnly = false,
}: {
  githubStars?: number | null;
  /** Landing hero uses a dark bar; docs/contact stay light. */
  tone?: "light" | "dark";
  /** Sit on top of a full-bleed stage with no separate header fill. */
  overlay?: boolean;
  /** Show mark only — skip the «طرحک» wordmark in the header. */
  logoOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const dark = tone === "dark";

  return (
    <header
      dir="rtl"
      lang="fa"
      className={cn(
        "z-20 flex h-[64px] items-center justify-between px-4 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal sm:h-[70px] sm:px-8 lg:px-12",
        overlay
          ? "absolute inset-x-0 top-0 bg-transparent"
          : cn("relative shrink-0", dark && "bg-[#0c0d12]"),
      )}
    >
      <div className="flex min-w-0 items-center gap-7 lg:gap-9">
        <Link href="/" aria-label="صفحهٔ اصلی طرحک" className="shrink-0">
          <BrandLogo invert={dark} wordmark={!logoOnly} />
        </Link>

        <nav className="hidden items-center gap-5 lg:flex lg:gap-6">
          {landingNavLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "text-[15px] transition-opacity duration-150 hover:opacity-70",
                dark ? "text-white/88" : "text-[#071A31]",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <GithubMarkLink stars={githubStars} dark={dark} />
        <button
          type="button"
          aria-label={open ? "بستن منو" : "باز کردن منو"}
          className={cn(
            "inline-flex size-10 items-center justify-center rounded-2xl transition-opacity duration-150 hover:opacity-70 lg:hidden",
            dark ? "text-white" : "text-[#071A31]",
          )}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">منو</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            {open ? (
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" />
            ) : (
              <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.5" />
            )}
          </svg>
        </button>
      </div>

      {open ? (
        <div
          className={cn(
            "absolute inset-x-4 top-[70px] z-30 flex flex-col gap-4 rounded-2xl border p-5 shadow-lg lg:hidden",
            dark
              ? "border-white/10 bg-[#14141A] text-white"
              : "border-black/5 bg-[#F5F3EE] text-[#071A31]",
          )}
        >
          {landingNavLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "text-[15px] transition-opacity duration-150 hover:opacity-70",
                dark ? "text-white/90" : "text-[#071A31]",
              )}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </header>
  );
}
