"use client";

import {
  BookOpen01Icon,
  Cancel01Icon,
  GridViewIcon,
  Mail01Icon,
  Menu01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useId, useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { BRAND_NAME_FA } from "@/lib/brand";
import { formatStarCount, GITHUB_URL } from "@/lib/github";
import { cn } from "@/lib/utils";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={16}
      height={16}
      aria-hidden
      className={cn("size-4 shrink-0", className)}
    >
      <path
        fill="currentColor"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"
      />
    </svg>
  );
}

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const SPRING_PANEL = {
  type: "spring" as const,
  stiffness: 420,
  damping: 36,
  mass: 0.7,
};

export const landingNavLinks: {
  label: string;
  href: string;
  icon: IconSvgElement;
  description: string;
}[] = [
  {
    label: "کامپوننت‌ها",
    href: "/browse",
    icon: GridViewIcon,
    description: "مرور و پیش‌نمایش کامپوننت‌ها",
  },
  {
    label: "مستندات",
    href: "/docs",
    icon: BookOpen01Icon,
    description: "راهنمای نصب و استفاده",
  },
  {
    label: "تماس",
    href: "/contact",
    icon: Mail01Icon,
    description: "پیام و همکاری",
  },
];

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
      <GithubIcon className={dark ? "text-white" : "text-[#071A31]"} />
      {count ? (
        <span
          dir="ltr"
          className="text-[13px] leading-none font-medium tabular-nums"
        >
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
  /** Show mark only — skip the Persian wordmark in the header. */
  logoOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion() ?? false;
  const menuId = useId();
  const dark = tone === "dark";

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

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
        <Link
          href="/"
          aria-label={`صفحهٔ اصلی ${BRAND_NAME_FA}`}
          className="shrink-0"
        >
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
          aria-expanded={open}
          aria-controls={menuId}
          className={cn(
            "inline-flex size-10 cursor-default items-center justify-center rounded-2xl outline-none transition-colors duration-150 lg:hidden",
            "focus-visible:ring-2 focus-visible:ring-offset-2",
            dark
              ? "text-white hover:bg-white/10 focus-visible:ring-white/40 focus-visible:ring-offset-[#0c0d12]"
              : "text-[#071A31] hover:bg-[#071A31]/6 focus-visible:ring-[#071A31]/30 focus-visible:ring-offset-white",
          )}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">منو</span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={open ? "close" : "menu"}
              initial={reduce ? false : { opacity: 0, rotate: -40, scale: 0.85 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, rotate: 40, scale: 0.85 }}
              transition={{ duration: 0.18, ease: EASE_OUT }}
              className="inline-flex"
            >
              <HugeiconsIcon
                icon={open ? Cancel01Icon : Menu01Icon}
                size={20}
              />
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label="بستن منو"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.2 }}
              className={cn(
                "fixed inset-0 z-30 lg:hidden",
                dark ? "bg-black/55" : "bg-[#071A31]/25",
              )}
              onClick={() => setOpen(false)}
            />
            <motion.nav
              id={menuId}
              aria-label="منوی اصلی"
              initial={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, y: -12, scale: 0.96, filter: "blur(6px)" }
              }
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, y: -8, scale: 0.98, filter: "blur(4px)" }
              }
              transition={reduce ? { duration: 0.12 } : SPRING_PANEL}
              className={cn(
                "absolute inset-x-4 top-[70px] z-40 overflow-hidden border p-1 shadow-lg lg:hidden",
                dark
                  ? "border-white/10 bg-[#14141A] text-white"
                  : "border-border bg-card text-foreground",
              )}
              style={{ borderRadius: 20 }}
            >
              <ul className="flex flex-col gap-1">
                {landingNavLinks.map((link, index) => (
                  <motion.li
                    key={link.href}
                    initial={
                      reduce ? false : { opacity: 0, y: 10, filter: "blur(4px)" }
                    }
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{
                      ...SPRING_PANEL,
                      delay: reduce ? 0 : 0.04 + index * 0.045,
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex cursor-default items-center gap-3 rounded-2xl px-3 py-2.5 outline-none transition-colors",
                        "focus-visible:ring-2 focus-visible:ring-ring",
                        dark
                          ? "hover:bg-white/8 focus-visible:bg-white/8"
                          : "hover:bg-accent focus-visible:bg-accent",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-10 shrink-0 place-items-center rounded-2xl border",
                          dark
                            ? "border-white/10 bg-white/6 text-white/80"
                            : "border-border bg-background text-muted-foreground",
                        )}
                      >
                        <HugeiconsIcon icon={link.icon} size={20} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-base leading-6">
                          {link.label}
                        </span>
                        <span
                          className={cn(
                            "mt-0.5 block text-sm",
                            dark ? "text-white/50" : "text-muted-foreground",
                          )}
                        >
                          {link.description}
                        </span>
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.nav>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
