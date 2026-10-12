"use client";

import { useEffect, useRef, type RefObject } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

import { cn } from "@/lib/utils";

export interface ProjectItem {
  id: string | number;
  tabTitle: string;
  title: string;
  description: string;
  image: string;
  link?: string;
  color: string;
  textColor?: string;
}

export const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: 1,
    tabTitle: "۰۱ · لوم",
    title: "لوم: فضای کاری آرام برای تیم‌های متمرکز",
    description:
      "مجموعهٔ همکاری بدون شلوغی، با چیدمان آرام، سطوح نرم و فضای خالی هدفمند تا تیم بدون نویز بصری فکر کند.",
    image: "/unsplash/1497366216548-37526070297c.webp",
    color: "#B9D6F2",
  },
  {
    id: 2,
    tabTitle: "۰۲ · مریدین",
    title: "مریدین: نگاشت سیستم برند که مقیاس می‌گیرد",
    description:
      "کتابخانهٔ زندهٔ توکن و کیت کامپوننت که محصول، مارکتینگ و داکس را روی یک زبان بصری نگه می‌دارد.",
    image: "/unsplash/1526170375885-4d8ecf77b99f.webp",
    color: "#B4E2C9",
  },
  {
    id: 3,
    tabTitle: "۰۳ · دریفت",
    title: "دریفت: روایت سرمقاله‌ای برای لیبل‌های مدرن",
    description:
      "تجربهٔ مجلهٔ اسکرولی برای هنرمندان مستقل. مصاحبهٔ بلند، تایپوگرافی نرم و عکسی مثل گوش‌دادن نیمه‌شب.",
    image: "/unsplash/1511379938547-c1f69419868d.webp",
    color: "#E9C5D7",
  },
  {
    id: 4,
    tabTitle: "۰۴ · هاربر",
    title: "هاربر: رزروی که حس مهمان‌نوازی دارد",
    description:
      "جریان رزرو بازطراحی‌شده حول نشانه‌های اعتماد، رنگ نرم و سلسله‌مراتب روشن تا مهمان قبل از رسیدن احساس خوشامد کند.",
    image: "/unsplash/1531123897727-8f129e1688ce.webp",
    color: "#EDD2B3",
  },
  {
    id: 5,
    tabTitle: "۰۵ · نورث‌لاین",
    title: "نورث‌لاین: آنالیتیکس بدون غرق‌شدن",
    description:
      "داشبورد متریک با نمودارهای روایی و تأکید ملایم؛ اپراتور بدون ویجت‌زدگی می‌بیند چه چیزی مهم است.",
    image: "/unsplash/1531746020798-e6953c6e8e04.webp",
    color: "#D2C6EC",
  },
];

interface AnimatedCardProps {
  project: ProjectItem;
  index: number;
  totalCards: number;
  smoothProgress: MotionValue<number>;
}

function buildCardKeyframes(index: number, totalCards: number) {
  const steps: number[] = [];
  const yValues: number[] = [];
  const scaleValues: number[] = [];
  const opacityValues: number[] = [];
  const numTransitions = Math.max(totalCards - 1, 1);

  for (let step = 0; step <= numTransitions; step++) {
    const progress = step / numTransitions;
    steps.push(progress);

    if (step < index) {
      // Park below the stage — keep travel short so a progress blip can't whip cards.
      yValues.push(640);
      scaleValues.push(1);
      opacityValues.push(1);
    } else if (step === index) {
      yValues.push(0);
      scaleValues.push(1);
      opacityValues.push(1);
    } else {
      const stackDepth = step - index;
      yValues.push(-stackDepth * 42);
      scaleValues.push(1 - stackDepth * 0.042);
      opacityValues.push(Math.max(0.55, 1 - stackDepth * 0.12));
    }
  }

  if (index === 0) {
    return {
      steps,
      y: yValues,
      scale: scaleValues,
      opacity: opacityValues,
    };
  }

  const entryStart = (index - 1) / numTransitions;
  const entryEnd = index / numTransitions;
  const fullSteps: number[] = [];
  const fullY: number[] = [];
  const fullScale: number[] = [];
  const fullOpacity: number[] = [];

  for (let i = 0; i < steps.length; i++) {
    if (steps[i]! < entryStart) {
      fullSteps.push(steps[i]!);
      fullY.push(640);
      fullScale.push(1);
      fullOpacity.push(1);
    }
  }

  fullSteps.push(entryStart);
  fullY.push(640);
  fullScale.push(1);
  fullOpacity.push(1);

  for (let i = 0; i < steps.length; i++) {
    if (steps[i]! >= entryEnd) {
      fullSteps.push(steps[i]!);
      fullY.push(yValues[i]!);
      fullScale.push(scaleValues[i]!);
      fullOpacity.push(opacityValues[i]!);
    }
  }

  return {
    steps: fullSteps,
    y: fullY,
    scale: fullScale,
    opacity: fullOpacity,
  };
}

function AnimatedCard({
  project,
  index,
  totalCards,
  smoothProgress,
}: AnimatedCardProps) {
  const keyframes = buildCardKeyframes(index, totalCards);
  const y = useTransform(smoothProgress, keyframes.steps, keyframes.y);
  const scale = useTransform(smoothProgress, keyframes.steps, keyframes.scale);
  const opacity = useTransform(
    smoothProgress,
    keyframes.steps,
    keyframes.opacity,
  );

  return (
    <motion.div
      style={{
        y,
        scale,
        opacity,
        zIndex: 700 + index * 10,
        transformOrigin: "center top",
        willChange: "transform, opacity",
        backfaceVisibility: "hidden",
        transformStyle: "preserve-3d",
      }}
      className="absolute inset-x-0 top-0 w-full select-none"
    >
      <a
        href={project.link ?? "#"}
        target={project.link ? "_blank" : undefined}
        rel={project.link ? "noopener noreferrer" : undefined}
        className="group block cursor-pointer text-inherit no-underline outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30 focus-visible:ring-offset-2"
        aria-label={`باز کردن ${project.title}`}
      >
        <article className="relative box-border w-full pt-11 sm:pt-12">
          {/* Folder tab */}
          <div
            style={{ backgroundColor: project.color }}
            className="absolute start-0 top-0 flex h-11 w-[10.5rem] items-center gap-2 rounded-t-[1.15rem] px-3.5 text-[0.92rem] font-semibold tracking-normal text-neutral-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-1px_0_rgba(0,0,0,0.06)] sm:h-12 sm:w-56 sm:px-5 sm:text-base"
          >
            <span
              className="size-1.5 shrink-0 rounded-full bg-neutral-950/25"
              aria-hidden
            />
            <span className="truncate">{project.tabTitle}</span>
          </div>

          <div
            style={{ backgroundColor: project.color }}
            className={cn(
              "relative grid min-h-[24rem] grid-cols-1 items-center gap-5 overflow-hidden",
              "rounded-b-[1.35rem] rounded-se-[1.35rem] p-5 sm:min-h-[27rem] sm:gap-6 sm:p-7",
              "md:min-h-[31rem] md:grid-cols-[minmax(0,1.08fr)_minmax(15rem,0.92fr)] md:gap-12 md:p-8",
              "ring-1 ring-black/6",
              "shadow-[0_1px_0_rgba(255,255,255,0.55)_inset,0_18px_40px_-22px_rgba(0,0,0,0.35),0_8px_18px_-12px_rgba(0,0,0,0.22)]",
            )}
          >
            {/* Soft top sheen */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-white/35 to-transparent"
              aria-hidden
            />

            <div className="relative z-10 flex flex-col items-start gap-3 text-start sm:gap-3.5">
              <h3 className="m-0 text-[1.35rem] font-semibold leading-[1.2] tracking-normal text-neutral-950 text-balance sm:text-[1.75rem] md:text-[1.95rem]">
                {project.title}
              </h3>

              <p className="m-0 max-w-[36rem] text-[0.95rem] font-normal leading-relaxed text-neutral-950/62 text-pretty sm:text-[1.05rem]">
                {project.description}
              </p>
            </div>

            <div className="relative isolate h-52 w-full overflow-hidden rounded-[1.05rem] bg-white/30 ring-1 ring-black/8 sm:h-64 md:h-[22rem] lg:h-[24rem]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.image}
                alt={project.title}
                decoding="async"
                loading={index === 0 ? "eager" : "lazy"}
                className="block h-full w-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.04]"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-white/10"
                aria-hidden
              />
            </div>
          </div>
        </article>
      </a>
    </motion.div>
  );
}

export interface ScrollStackDeckProps {
  projects?: ProjectItem[];
  title?: string;
  subtitle?: string;
  scrollIndicatorText?: string;
  className?: string;
  showFooter?: boolean;
  enableLenis?: boolean;
  /** Nested overflow parent. Omit on a full-page landing (window + Lenis). */
  container?: RefObject<HTMLElement | null>;
}

export function ScrollStackDeck({
  projects = DEFAULT_PROJECTS,
  title = "کارهای برگزیده",
  subtitle = "پنج ساخت اخیر: رابط‌های نرم، سیستم‌های روشن، و داستان محصولی که با اسکرول آرام دوام می‌آورد.",
  scrollIndicatorText = "اسکرول کنید",
  className = "",
  showFooter = true,
  enableLenis = true,
  container,
}: ScrollStackDeckProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nested = Boolean(container);
  const showIntro = Boolean(title || subtitle || scrollIndicatorText);

  useEffect(() => {
    if (!enableLenis || container) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    let animationFrameId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    };
    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
    };
  }, [enableLenis, container]);

  // No useSpring — springing scroll progress makes the whole deck whip on mount
  // when the nested scroller/ref finishes measuring.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
    ...(container ? { container } : {}),
  });

  return (
    <div
      dir="rtl"
      lang="fa"
      className={cn(
        "w-full bg-[#EEF1F4] antialiased",
        nested ? "min-h-0" : "min-h-screen",
        "font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal",
        "text-neutral-900 selection:bg-neutral-900 selection:text-white",
        "dark:bg-[hsl(225_7%_11%)] dark:text-neutral-100 dark:selection:bg-white dark:selection:text-neutral-900",
        className,
      )}
    >
      {/* Lead-in clears open chrome; keep modest so progress starts near 0. */}
      <div
        className={nested ? "h-28 max-md:h-24" : showIntro ? "hidden" : "h-[28vh]"}
        aria-hidden
      />

      {showIntro ? (
        <section className="flex w-full flex-col items-center justify-center px-4 py-16 text-center">
          <div className="flex max-w-3xl flex-col items-center gap-5">
            <div className="flex flex-col items-center gap-2.5">
              <h1 className="m-0 text-3xl font-semibold text-neutral-900 sm:text-4xl">
                {title}
              </h1>
              <p className="m-0 max-w-2xl text-xl font-normal leading-relaxed text-neutral-600 sm:text-2xl">
                {subtitle}
              </p>
            </div>

            <div className="mt-2 flex items-center justify-center gap-2.5">
              <span className="text-lg font-normal leading-relaxed text-neutral-600 sm:text-xl">
                {scrollIndicatorText}
              </span>
              <motion.svg
                animate={{ y: [0, 5, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.8,
                  ease: "easeInOut",
                }}
                className="h-6 w-6 text-neutral-900"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 4.75v13.5M6.75 13.75l5.25 5.5 5.25-5.5" />
              </motion.svg>
            </div>
          </div>
        </section>
      ) : null}

      <section
        ref={containerRef}
        aria-label="نمایش پشته‌ای پروژه‌ها"
        className="relative w-full"
        style={{ height: `${projects.length * 110}vh` }}
      >
        <div
          className={cn(
            "pointer-events-none sticky top-0 flex h-dvh min-h-dvh w-full items-center justify-center px-3 sm:px-5",
            // Nested docs: bias slightly down so the deck clears header + hint.
            nested && "pt-24 pb-28 max-md:pt-20 max-md:pb-24",
          )}
        >
          <div className="pointer-events-auto relative h-[min(27rem,46dvh)] w-[min(calc(100%-0.25rem),62.5rem)] overflow-visible sm:h-[min(31rem,52dvh)] md:h-[33rem]">
            {projects.map((project, index) => (
              <AnimatedCard
                key={project.id}
                project={project}
                index={index}
                totalCards={projects.length}
                smoothProgress={scrollYProgress}
              />
            ))}
          </div>
        </div>
      </section>

      {showFooter ? (
        <footer className="flex h-[50vh] flex-col items-center justify-center gap-2 text-sm text-neutral-500">
          <p>طرحَک</p>
          <p className="text-xs text-neutral-400">
            سیستم نرم · ساخت محصول · موشن
          </p>
        </footer>
      ) : null}
    </div>
  );
}

export default ScrollStackDeck;
