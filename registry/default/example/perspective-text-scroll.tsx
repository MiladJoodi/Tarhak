"use client";

import { useEffect, useRef } from "react";

const DEFAULT_TEXT =
  "طراحی خوب وقتی حس می‌شود که فاصله‌ها نفس بکشند، تایپ خوانا بماند، و حرکت عمدی باشد — نه تزئینی.";

const KEYFRAMES = [
  { p: 0.0, rotX: 42, transY: 520, transZ: -30, opacity: 0.0 },
  { p: 0.12, rotX: 38, transY: 220, transZ: -10, opacity: 1.0 },
  { p: 0.5, rotX: 0, transY: 0, transZ: 25, opacity: 1.0 },
  { p: 0.85, rotX: -24, transY: -180, transZ: 45, opacity: 1.0 },
  { p: 1.0, rotX: -36, transY: -320, transZ: 60, opacity: 0.0 },
];

const LERP = 0.06;

function getScrollParent(node: HTMLElement | null): HTMLElement | Window {
  let parent = node?.parentElement ?? null;
  while (parent) {
    const { overflow, overflowY } = getComputedStyle(parent);
    if (/(auto|scroll|overlay)/.test(overflowY) || /(auto|scroll|overlay)/.test(overflow)) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return window;
}

function interpolateKeyframes(p: number) {
  const clampedP = Math.max(0, Math.min(1, p));

  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    const k1 = KEYFRAMES[i]!;
    const k2 = KEYFRAMES[i + 1]!;

    if (clampedP >= k1.p && clampedP <= k2.p) {
      const t = (clampedP - k1.p) / (k2.p - k1.p);
      return {
        rotX: k1.rotX + (k2.rotX - k1.rotX) * t,
        transY: k1.transY + (k2.transY - k1.transY) * t,
        transZ: k1.transZ + (k2.transZ - k1.transZ) * t,
        opacity: k1.opacity + (k2.opacity - k1.opacity) * t,
      };
    }
  }

  const last = KEYFRAMES[KEYFRAMES.length - 1]!;
  return {
    rotX: last.rotX,
    transY: last.transY,
    transZ: last.transZ,
    opacity: last.opacity,
  };
}

export function PerspectiveTextScroll() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);

  const stateRef = useRef({
    currentProgress: 0,
    targetProgress: 0,
    rafId: 0,
  });

  const applyTransform = (p: number) => {
    if (!textRef.current) return;

    const values = interpolateKeyframes(p);

    textRef.current.style.transform = `rotateX(${values.rotX.toFixed(4)}deg) translate3d(0px, ${values.transY.toFixed(4)}px, ${values.transZ.toFixed(4)}px)`;
    textRef.current.style.opacity = values.opacity.toFixed(4);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Docs shell scrolls <main>, not window — window scroll never fires there.
    const scrollRoot = getScrollParent(container);

    const calculateTargetProgress = () => {
      const rect = container.getBoundingClientRect();
      const viewHeight =
        scrollRoot instanceof Window
          ? window.innerHeight
          : scrollRoot.clientHeight;
      const totalScrollDistance = rect.height - viewHeight;

      if (totalScrollDistance <= 0) return 0;

      const currentScroll = -rect.top;
      return Math.max(0, Math.min(1, currentScroll / totalScrollDistance));
    };

    const handleScroll = () => {
      stateRef.current.targetProgress = calculateTargetProgress();
    };

    const renderLoop = () => {
      const state = stateRef.current;
      const diff = state.targetProgress - state.currentProgress;

      if (Math.abs(diff) > 0.00002) {
        state.currentProgress += diff * LERP;
        applyTransform(state.currentProgress);
      }

      state.rafId = requestAnimationFrame(renderLoop);
    };

    scrollRoot.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    stateRef.current.targetProgress = calculateTargetProgress();
    stateRef.current.currentProgress = stateRef.current.targetProgress;
    applyTransform(stateRef.current.currentProgress);

    stateRef.current.rafId = requestAnimationFrame(renderLoop);

    return () => {
      scrollRoot.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      cancelAnimationFrame(stateRef.current.rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      dir="rtl"
      lang="fa"
      role="region"
      aria-label="اسکرول متن سه‌بعدی"
      className="relative w-full bg-[#F7F4F2] font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal text-[#5F7F6B] dark:bg-[hsl(225_7%_11%)] dark:text-[#C5D9CC]"
      style={{ height: "500vh" }}
    >
      <div
        className="sticky top-0 start-0 flex h-screen w-full items-center justify-center overflow-hidden perspective-[200px]"
        style={{ perspectiveOrigin: "50% 50%" }}
      >
        <div
          ref={textRef}
          className="relative w-full max-w-lg px-6 text-center text-[1.125rem] font-medium leading-[1.85] sm:max-w-xl sm:text-[1.25rem] sm:leading-[1.9]"
          style={{
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            willChange: "transform, opacity",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
            transform: "rotateX(42deg) translate3d(0px, 520px, -30px)",
            opacity: 0,
          }}
        >
          {DEFAULT_TEXT}

          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[28%] select-none bg-linear-to-b from-transparent to-[#F7F4F2] dark:to-[hsl(225_7%_11%)]"
          />
        </div>
      </div>
    </div>
  );
}

export default PerspectiveTextScroll;
