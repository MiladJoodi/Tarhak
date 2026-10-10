"use client";

import React, { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Bookmark02Icon,
  Share03Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";

export type SpotlightShape = "circle" | "beam";

export type SpotlightCardProps = React.HTMLAttributes<HTMLDivElement> & {
  spotlightColor?: string;
  intensity?: number;
  spotlightSize?: number;
  softness?: number;
  shape?: SpotlightShape;
  borderGlow?: number;
  proximity?: number;
  smoothing?: number;
  ambient?: boolean;
  flare?: boolean;
  grain?: number;
  theme?: "dark" | "light";
};

type Palette = {
  surface: string;
  border: string;
  shadow: string;
  light: string;
  fill: number;
  edge: number;
};

type Settings = {
  shape: SpotlightShape;
  fill: string;
  edge: string;
  size: number;
  intensity: number;
  borderGlow: number;
  proximity: number;
  smoothing: number;
  ambient: boolean;
  flare: boolean;
  grain: number;
};

const THEMES: Record<"dark" | "light", Palette> = {
  dark: {
    surface: "#111111",
    border: "rgba(255, 255, 255, 0.08)",
    shadow: "0 24px 48px -24px rgba(0, 0, 0, 0.6)",
    light: "#ffffff",
    fill: 1,
    edge: 1,
  },
  light: {
    surface: "#ffffff",
    border: "rgba(24, 24, 27, 0.1)",
    shadow:
      "0 1px 2px rgba(24, 24, 27, 0.04), 0 18px 40px -20px rgba(24, 24, 27, 0.16)",
    light: "#18181b",
    fill: 0.28,
    edge: 0.7,
  },
};

const SHAPES: SpotlightShape[] = ["circle", "beam"];

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const CARD =
  "relative isolate overflow-hidden rounded-[28px] p-6 [background-color:var(--spotlight-card-surface)] [box-shadow:var(--spotlight-card-shadow)]";

const BORDER_MASK =
  "pointer-events-none absolute inset-0 z-[1] rounded-[inherit] p-px [-webkit-mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] [-webkit-mask-composite:xor] [mask:linear-gradient(#000_0_0)_content-box_exclude,linear-gradient(#000_0_0)]";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const falloff = (color: string, softness: number) => {
  const soft = clamp(softness, 0, 1);
  const core = (1 - soft) ** 1.5 * 0.85;
  const stop = (alpha: number, at: number) =>
    `color-mix(in srgb, ${color} ${(alpha * 100).toFixed(2)}%, transparent) ${(at * 100).toFixed(2)}%`;
  const list = [stop(1, 0)];
  for (let i = 0; i <= 14; i++) {
    const t = core + ((1 - core) * i) / 14;
    const g = (t - core) / (1 - core);
    const smooth = 1 - g * g * (3 - 2 * g);
    const glow = Math.exp(-4.6 * g * g) * (1 - g ** 6);
    list.push(stop(smooth + (glow - smooth) * soft, t));
  }
  return list.join(", ");
};

export function SpotlightCard({
  children,
  className = "",
  style,
  spotlightColor,
  intensity = 0.15,
  spotlightSize = 240,
  softness = 0.7,
  shape = "circle",
  borderGlow = 0.6,
  proximity = 80,
  smoothing = 0.3,
  ambient = false,
  flare = true,
  grain = 0,
  theme = "dark",
  ...rest
}: SpotlightCardProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLSpanElement>(null);
  const grainRef = useRef<HTMLSpanElement>(null);
  const edgeRef = useRef<HTMLSpanElement>(null);
  const wakeRef = useRef<(() => void) | null>(null);
  const palette = THEMES[theme] ?? THEMES.dark;
  const color = spotlightColor ?? palette.light;
  const form = SHAPES.includes(shape) ? shape : "circle";
  const settings: Settings = {
    shape: form,
    fill: falloff(color, softness),
    edge: falloff(color, 1),
    size: Math.max(20, spotlightSize),
    intensity: clamp(intensity, 0, 1) * palette.fill,
    borderGlow: clamp(borderGlow, 0, 1) * palette.edge,
    proximity: Math.max(0, proximity),
    smoothing: clamp(smoothing, 0, 1),
    ambient,
    flare,
    grain: clamp(grain, 0, 1),
  };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    wakeRef.current?.();
  });

  useEffect(() => {
    const root = rootRef.current;
    const light = lightRef.current;
    const noise = grainRef.current;
    const edge = edgeRef.current;
    if (!root || !light || !noise || !edge) return undefined;

    const reduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const state = {
      x: 0,
      y: 0,
      presence: 0,
      flare: 0,
      time: Math.random() * 60,
      pressed: false,
      visible: true,
    };
    const pointer = { x: 0, y: 0, active: false };
    const drawn = { light: "", edge: "", noise: "" };
    let focus: Element | null = null;
    let raf = 0;
    let last = 0;
    let alive = true;

    const gradient = (
      s: Settings,
      size: number,
      x: number,
      y: number,
      stops: string,
    ) => {
      if (s.shape === "beam") {
        const reach = Math.max(size * 0.6, y + size * 0.55);
        return `radial-gradient(${(size * 0.55).toFixed(1)}px ${reach.toFixed(1)}px at ${x.toFixed(1)}px 0px, ${stops})`;
      }
      return `radial-gradient(circle ${size.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px, ${stops})`;
    };

    const paint = (s: Settings) => {
      const size = s.size * (1 + 0.2 * state.flare);
      const boost = 1 + 0.7 * state.flare;
      const fill = gradient(s, size, state.x, state.y, s.fill);
      const rim = gradient(
        s,
        size * 0.6,
        state.x,
        s.shape === "beam" ? 0 : state.y,
        s.edge,
      );
      if (fill !== drawn.light) {
        drawn.light = fill;
        light.style.background = fill;
      }
      if (rim !== drawn.edge) {
        drawn.edge = rim;
        edge.style.background = rim;
      }
      light.style.opacity = String(
        Math.min(1, state.presence * s.intensity * boost),
      );
      edge.style.opacity = String(
        Math.min(1, state.presence * s.borderGlow * boost),
      );
      const grainy =
        s.grain > 0
          ? gradient(s, size, state.x, state.y, "#000 0%, transparent 100%")
          : "none";
      if (grainy !== drawn.noise) {
        drawn.noise = grainy;
        noise.style.webkitMaskImage = grainy;
        noise.style.maskImage = grainy;
      }
      noise.style.opacity = String(state.presence * s.grain);
    };

    const tick = (now: number) => {
      raf = 0;
      if (!alive) return;
      const s = settingsRef.current;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      const rect = root.getBoundingClientRect();
      let tx = state.x;
      let ty = state.y;
      let target = 0;
      if (focus && root.contains(focus)) {
        const box = focus.getBoundingClientRect();
        tx = box.left + box.width / 2 - rect.left;
        ty = box.top + box.height / 2 - rect.top;
        target = 1;
      } else if (pointer.active) {
        tx = pointer.x - rect.left;
        ty = pointer.y - rect.top;
        const gap = Math.hypot(
          Math.max(0, -tx, tx - rect.width),
          Math.max(0, -ty, ty - rect.height),
        );
        if (gap === 0) target = 1;
        else if (s.proximity > 0) target = Math.max(0, 1 - gap / s.proximity) ** 2;
      }
      if (target < 0.6 && s.ambient && state.visible) {
        if (!reduce) state.time += dt;
        const drift = 0.6 - target;
        tx +=
          (rect.width * (0.5 + 0.34 * Math.sin(state.time * 0.43)) - tx) *
          (drift / 0.6);
        ty +=
          (rect.height * (0.5 + 0.3 * Math.sin(state.time * 0.61 + 1.3)) - ty) *
          (drift / 0.6);
        target = 0.6;
      }
      if (state.presence < 0.02 && target > 0 && !s.ambient) {
        state.x = tx;
        state.y = ty;
      }
      const follow =
        reduce || s.smoothing === 0
          ? 1
          : 1 - Math.exp(-dt / (0.015 + s.smoothing * 0.22));
      state.x += (tx - state.x) * follow;
      state.y += (ty - state.y) * follow;
      const fade = reduce
        ? 1
        : 1 - Math.exp(-dt / (target > state.presence ? 0.1 : 0.32));
      state.presence += (target - state.presence) * fade;
      if (Math.abs(target - state.presence) < 0.002) state.presence = target;
      const press = state.pressed && s.flare && !reduce ? 1 : 0;
      state.flare +=
        (press - state.flare) * (1 - Math.exp(-dt / (press ? 0.05 : 0.28)));
      if (Math.abs(press - state.flare) < 0.002) state.flare = press;
      paint(s);
      const moving =
        Math.abs(tx - state.x) > 0.1 || Math.abs(ty - state.y) > 0.1;
      const settled =
        !moving && state.presence === target && state.flare === press;
      if (!settled || (s.ambient && state.visible && !reduce)) {
        raf = requestAnimationFrame(tick);
      }
    };

    const wake = () => {
      if (raf || !alive) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    wakeRef.current = wake;

    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      if (
        state.presence > 0 ||
        settingsRef.current.proximity > 0 ||
        root.contains(event.target as Node | null)
      ) {
        wake();
      }
    };
    const onOut = (event: PointerEvent) => {
      if (event.relatedTarget) return;
      pointer.active = false;
      wake();
    };
    const onDown = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      state.pressed = true;
      wake();
    };
    const onUp = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") pointer.active = false;
      if (!state.pressed && event.pointerType === "mouse") return;
      state.pressed = false;
      wake();
    };
    const onFocusIn = (event: FocusEvent) => {
      if (
        !(event.target instanceof Element) ||
        !event.target.matches(":focus-visible")
      ) {
        return;
      }
      focus = event.target;
      wake();
    };
    const onFocusOut = (event: FocusEvent) => {
      if (root.contains(event.relatedTarget as Node | null)) return;
      focus = null;
      wake();
    };
    const onScroll = () => {
      if (pointer.active || state.presence > 0) wake();
    };

    const observer = new IntersectionObserver((entries) => {
      state.visible = entries.some((entry) => entry.isIntersecting);
      if (state.visible) wake();
    });
    observer.observe(root);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    document.addEventListener("pointerout", onOut);
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);
    wake();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("scroll", onScroll, { capture: true });
      document.removeEventListener("pointerout", onOut);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
      wakeRef.current = null;
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`${CARD}${className ? ` ${className}` : ""}`}
      style={
        {
          "--spotlight-card-surface": palette.surface,
          "--spotlight-card-border": palette.border,
          "--spotlight-card-shadow": palette.shadow,
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      <span
        ref={lightRef}
        className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-0"
        aria-hidden="true"
      />
      <span
        ref={grainRef}
        className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-[length:160px_160px] opacity-0 mix-blend-overlay"
        style={{ backgroundImage: NOISE }}
        aria-hidden="true"
      />
      {children}
      <span
        className={`${BORDER_MASK} [background:var(--spotlight-card-border)]`}
        aria-hidden="true"
      />
      <span
        ref={edgeRef}
        className={`${BORDER_MASK} opacity-0`}
        aria-hidden="true"
      />
    </div>
  );
}

const AVATAR =
  "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=240&h=240&fit=crop&crop=focalpoint&fp-x=0.64&fp-y=0.355&fp-z=1.45&sat=-100&q=80";

const SKILLS = ["فیگما", "طراحی UX"] as const;

const STATS = [
  { value: "۴٫۵", label: "امتیاز", star: true },
  { value: "+۱۵ هزار", label: "درآمد" },
  { value: "۸۰ دلار / ساعت", label: "نرخ" },
] as const;

const GLASS = {
  dark: {
    bg: "rgba(255, 255, 255, 0.08)",
    hover: "rgba(255, 255, 255, 0.13)",
    shadow:
      "inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 10px 24px -12px rgba(0, 0, 0, 0.7)",
  },
  light: {
    bg: "rgba(24, 24, 27, 0.05)",
    hover: "rgba(24, 24, 27, 0.08)",
    shadow:
      "inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 10px 24px -14px rgba(24, 24, 27, 0.3)",
  },
} as const;

/** Follows OpenPreview’s `.dark` / `.light` wrapper (docs theme toggle). */
function usePreviewTheme() {
  const rootRef = useRef<HTMLElement>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const read = () => {
      const themed = el.closest(".dark, .light");
      if (themed?.classList.contains("light")) {
        setTheme("light");
        return;
      }
      if (themed?.classList.contains("dark")) {
        setTheme("dark");
        return;
      }
      setTheme(
        document.documentElement.classList.contains("dark") ? "dark" : "light",
      );
    };

    read();
    const host = el.closest(".component-showcase") ?? document.documentElement;
    const obs = new MutationObserver(read);
    obs.observe(host, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  return { theme, rootRef } as const;
}

function ProfileContent({ theme }: { theme: "dark" | "light" }) {
  const [saved, setSaved] = useState(false);
  const glass = GLASS[theme];
  const light = theme === "light";

  const glassBtnStyle: React.CSSProperties = {
    backgroundColor: glass.bg,
    boxShadow: glass.shadow,
    backdropFilter: "blur(14px) saturate(1.6)",
  };

  return (
    <div
      dir="rtl"
      lang="fa"
      className={`relative z-0 flex w-full flex-col gap-5 ${
        light ? "text-zinc-900" : "text-white"
      }`}
      style={{ direction: "rtl", textAlign: "right" }}
    >
      {/* ردیف بالا: آواتار راست، اشتراک چپ */}
      <div className="flex w-full items-center gap-3">
        <div
          role="img"
          aria-label="ایتان هریسون"
          className="size-[60px] shrink-0 rounded-full bg-cover bg-center"
          style={{ backgroundImage: `url(${AVATAR})` }}
        />
        <div className="min-w-0 flex-1 text-right">
          <p className="truncate text-[1.35rem] font-semibold leading-tight tracking-normal">
            ایتان هریسون
          </p>
          <p
            className={`mt-1 text-[0.95rem] leading-snug ${
              light ? "text-zinc-500" : "text-white/55"
            }`}
          >
            طراح محصول
          </p>
        </div>
        <button
          type="button"
          aria-label="اشتراک‌گذاری پروفایل"
          className="flex size-9 shrink-0 items-center justify-center rounded-full border-0 text-inherit transition-colors"
          style={glassBtnStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = glass.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = glass.bg;
          }}
        >
          <HugeiconsIcon icon={Share03Icon} size={20} strokeWidth={1.6} />
        </button>
      </div>

      <div className="flex w-full flex-wrap gap-2">
        {SKILLS.map((skill) => (
          <div
            key={skill}
            className={`rounded-full px-3 py-1 text-[0.8rem] ${
              light
                ? "bg-zinc-900/5 text-zinc-700"
                : "bg-white/[0.08] text-white/80"
            }`}
          >
            {skill}
          </div>
        ))}
      </div>

      <div className="grid w-full grid-cols-3 gap-2">
        {STATS.map((stat) => (
          <div key={stat.label} className="min-w-0 text-right">
            <div className="flex items-center justify-start gap-1 text-[1.05rem] font-semibold">
              <span>{stat.value}</span>
              {"star" in stat && stat.star ? (
                <HugeiconsIcon
                  icon={StarIcon}
                  size={14}
                  strokeWidth={1.8}
                  className={`shrink-0 ${light ? "text-amber-500" : "text-amber-300"}`}
                />
              ) : null}
            </div>
            <p
              className={`mt-1 text-[0.75rem] ${
                light ? "text-zinc-500" : "text-white/45"
              }`}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="flex w-full items-center gap-2.5">
        <button
          type="button"
          className="h-12 min-w-0 flex-1 rounded-full border-0 px-4 text-[0.95rem] font-medium text-inherit transition-colors"
          style={glassBtnStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = glass.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = glass.bg;
          }}
        >
          تماس بگیرید
        </button>
        <button
          type="button"
          aria-label="نشان‌کردن پروفایل"
          aria-pressed={saved}
          onClick={() => setSaved((v) => !v)}
          className={`flex size-12 shrink-0 items-center justify-center rounded-full border-0 text-inherit transition-colors ${
            saved ? (light ? "text-amber-500" : "text-amber-300") : ""
          }`}
          style={glassBtnStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = glass.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = glass.bg;
          }}
        >
          <HugeiconsIcon
            icon={Bookmark02Icon}
            size={20}
            strokeWidth={1.7}
            fill={saved ? "currentColor" : "none"}
          />
        </button>
      </div>
    </div>
  );
}

/** پیش‌نمایش فارسی — همان دموی React Bits با محتوای RTL. */
export default function SpotlightCardExample() {
  const { theme, rootRef } = usePreviewTheme();

  return (
    <section
      ref={rootRef}
      dir="rtl"
      lang="fa"
      className="flex h-full min-h-[28rem] w-full items-center justify-center bg-transparent px-4 py-10 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <SpotlightCard
        dir="rtl"
        lang="fa"
        theme={theme}
        className="w-full max-w-[330px] text-right"
        style={{ padding: 24, borderRadius: 28, direction: "rtl", textAlign: "right" }}
      >
        <ProfileContent theme={theme} />
      </SpotlightCard>
    </section>
  );
}
