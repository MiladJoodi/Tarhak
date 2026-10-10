"use client";

import {
  useEffect,
  useRef,
  type ComponentPropsWithoutRef,
} from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";

import { cn } from "@/lib/utils";

export interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number;
  startValue?: number;
  direction?: "up" | "down";
  /** Delay before counting, in seconds. */
  delay?: number;
  decimalPlaces?: number;
  /** `fa-IR` Persian digits by default. */
  locale?: string;
}

function formatNumber(
  value: number,
  decimalPlaces: number,
  locale: string,
) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(Number(value.toFixed(decimalPlaces)));
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

export function NumberTicker({
  value,
  startValue = 0,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  locale = "fa-IR",
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const initial = direction === "down" ? value : startValue;
  const target = direction === "down" ? startValue : value;
  const motionValue = useMotionValue(initial);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (!isInView) return;

    if (prefersReducedMotion()) {
      motionValue.set(target);
      if (ref.current) {
        ref.current.textContent = formatNumber(target, decimalPlaces, locale);
      }
      return;
    }

    timer = setTimeout(() => {
      motionValue.set(target);
    }, delay * 1000);

    return () => {
      if (timer !== null) clearTimeout(timer);
    };
  }, [motionValue, isInView, delay, target, decimalPlaces, locale]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (!ref.current) return;
      ref.current.textContent = formatNumber(latest, decimalPlaces, locale);
    });
    return unsubscribe;
  }, [springValue, decimalPlaces, locale]);

  return (
    <span
      ref={ref}
      dir="ltr"
      className={cn(
        "inline-block tabular-nums text-foreground tracking-normal",
        className,
      )}
      {...props}
    >
      {formatNumber(initial, decimalPlaces, locale)}
    </span>
  );
}

export default function NumberTickerDemo() {
  return (
    <section
      dir="rtl"
      lang="fa"
      aria-label="شمارنده عددی انیمیشنی"
      className="flex w-full max-w-md flex-col items-center gap-8 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <div className="flex flex-col items-center gap-2">
        <NumberTicker
          value={1280}
          className="text-5xl font-semibold sm:text-6xl"
        />
        <p className="text-sm text-muted-foreground">کاربر فعال</p>
      </div>

      <div className="flex w-full items-end justify-center gap-10">
        <div className="flex flex-col items-center gap-1.5">
          <NumberTicker
            value={5.67}
            decimalPlaces={2}
            delay={0.15}
            className="text-3xl font-medium"
          />
          <p className="text-xs text-muted-foreground">میانگین امتیاز</p>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <NumberTicker
            value={100}
            startValue={80}
            delay={0.25}
            className="text-3xl font-medium"
          />
          <p className="text-xs text-muted-foreground">از ۸۰ تا ۱۰۰</p>
        </div>
      </div>
    </section>
  );
}
