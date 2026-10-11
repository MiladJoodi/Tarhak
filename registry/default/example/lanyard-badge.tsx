"use client";
// Adapted from 21st.dev/@kedhareswer/components/lanyard-badge (MIT)

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

type Particle = { x: number; y: number; px: number; py: number; w: number };
type Constraint = [number, number, number];
type StrapTheme = {
  color: string;
  ink: string;
  text: string;
  label: string;
  plain?: boolean;
};

export interface LanyardBadgeProps {
  front?: ReactNode;
  back?: ReactNode;
  title?: string;
  subtitle?: string;
  name?: string;
  role?: string;
  strapText?: string;
  strapLabel?: string;
  strapColor?: string;
  /** Ink on the woven strap; falls back to `inkColor`. */
  strapInkColor?: string;
  inkColor?: string;
  cardColor?: string;
  flipButton?: boolean;
  cardWidth?: number;
  height?: CSSProperties["height"];
  className?: string;
}

const PERSIAN_FONT =
  "var(--font-estedad), Tahoma, Arial, sans-serif";

function canvasFontFamily() {
  if (typeof document === "undefined") return "Tahoma, Arial, sans-serif";
  const fromVar = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-estedad")
    .trim();
  return fromVar
    ? `${fromVar}, Tahoma, Arial, sans-serif`
    : "Tahoma, Arial, sans-serif";
}

function integrate(
  particles: Particle[],
  dt: number,
  gravity: number,
  damping: number,
) {
  for (const p of particles) {
    if (!p.w) continue;
    const vx = (p.x - p.px) * damping;
    const vy = (p.y - p.py) * damping;
    p.px = p.x;
    p.py = p.y;
    p.x += vx;
    p.y += vy + gravity * dt * dt;
  }
}

function solveConstraints(
  particles: Particle[],
  constraints: Constraint[],
  iterations: number,
) {
  for (let i = 0; i < iterations; i++) {
    for (const [ai, bi, rest] of constraints) {
      const a = particles[ai];
      const b = particles[bi];
      const sum = a.w + b.w;
      if (!sum) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 1e-6;
      const corr = (dist - rest) / (dist * sum);
      a.x += dx * corr * a.w;
      a.y += dy * corr * a.w;
      b.x -= dx * corr * b.w;
      b.y -= dy * corr * b.w;
    }
  }
}

function springAngle(
  state: { a: number; v: number },
  target: number,
  dt: number,
  torque: number,
) {
  state.v += (-(state.a - target) * 18 - state.v * 3.2 + torque) * dt;
  state.a += state.v * dt;
}

function angleBetween(a: Particle, b: Particle) {
  return Math.atan2(b.x - a.x, b.y - a.y);
}

function drawSeal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.lineWidth = Math.max(0.8, r * 0.018);
  for (const scale of [1, 0.9, 0.62, 0.26]) {
    ctx.beginPath();
    ctx.arc(0, 0, r * scale, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (let i = 0; i < 16; i++) {
    ctx.save();
    ctx.rotate((i / 16) * Math.PI * 2);
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.76, r * 0.07, r * 0.13, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.rotate(Math.PI / 16);
    ctx.beginPath();
    ctx.arc(0, -r * 0.95, r * 0.018, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  for (let i = 0; i < 8; i++) {
    ctx.save();
    ctx.rotate((i / 8) * Math.PI * 2);
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.26);
    ctx.bezierCurveTo(r * 0.12, -r * 0.4, r * 0.1, -r * 0.52, 0, -r * 0.6);
    ctx.bezierCurveTo(-r * 0.1, -r * 0.52, -r * 0.12, -r * 0.4, 0, -r * 0.26);
    ctx.stroke();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function buildStrapTexture(
  length: number,
  width: number,
  dpr: number,
  theme: StrapTheme,
) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(length * dpr));
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.setTransform(0, dpr, -dpr, 0, canvas.width, 0);
  ctx.fillStyle = theme.color;
  ctx.fillRect(0, 0, length, width);
  ctx.strokeStyle = ctx.fillStyle = theme.ink;

  if (!theme.plain) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, length, width);
    ctx.clip();
    ctx.textBaseline = "middle";
    const family = canvasFontFamily();
    const script = `700 ${Math.round(width * 0.42)}px ${family}`;
    const display = `800 ${Math.round(width * 0.34)}px ${family}`;
    ctx.font = script;
    const textW = ctx.measureText(theme.text).width;
    ctx.font = display;
    const labelW = ctx.measureText(theme.label).width;
    const gap = width * 0.6;
    let x = width * 0.4;
    let flip = 1;
    while (x < length) {
      ctx.globalAlpha = 0.55;
      drawSeal(ctx, x + width * 1.3, width * (0.5 + flip * 0.28), width * 1.35);
      x += width * 2.8;
      ctx.globalAlpha = 0.95;
      ctx.font = script;
      ctx.fillText(theme.text, x, width * 0.52);
      x += textW + gap;
      if (theme.label) {
        ctx.font = display;
        ctx.fillText(`-  ${theme.label}  -`, x, width * 0.53);
        x += labelW + ctx.measureText("-    -").width + gap;
      }
      flip = -flip;
    }
    ctx.restore();
  }

  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 1.5);
  ctx.lineTo(length, 1.5);
  ctx.moveTo(0, width - 1.5);
  ctx.lineTo(length, width - 1.5);
  ctx.stroke();
  return canvas;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function SealMark({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  const angles = Array.from({ length: 16 }, (_, i) => i * 22.5);
  return (
    <svg
      viewBox="-100 -100 200 200"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      className={className}
      style={style}
      aria-hidden
    >
      <circle r={96} />
      <circle r={86} />
      <circle r={60} />
      <circle r={25} />
      {angles.map((deg) => (
        <ellipse
          key={deg}
          cx={0}
          cy={-73}
          rx={6.5}
          ry={12}
          transform={`rotate(${deg})`}
        />
      ))}
      {angles.map((deg) => (
        <circle
          key={`d${deg}`}
          cx={0}
          cy={-91}
          r={1.8}
          fill="currentColor"
          transform={`rotate(${deg + 11.25})`}
        />
      ))}
      {angles.slice(0, 8).map((deg, i) => (
        <path
          key={`p${i}`}
          d="M0 -25 C 12 -38, 10 -50, 0 -58 C -10 -50, -12 -38, 0 -25"
          transform={`rotate(${i * 45})`}
        />
      ))}
      <circle r={6} fill="currentColor" />
    </svg>
  );
}

function ArrowMark({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 20 200"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      className={className}
      style={style}
      aria-hidden
    >
      <path d="M10 4 L10 196 M3 18 L10 4 L17 18 M4 182 L10 170 L16 182 M4 194 L10 182 L16 194" />
    </svg>
  );
}

export function LanyardBadge({
  front,
  back,
  title = "طرحَک",
  subtitle = "کامپوننت‌های متحرک ری‌اکت",
  name = "طرحَک",
  role = "ری‌اکت · موشن · تیلویند",
  strapText = "طرحَک",
  strapLabel = "TARHAK",
  strapColor = "#7a5c3e",
  strapInkColor,
  inkColor = "#1f1406",
  cardColor = "#b8860b",
  flipButton = true,
  cardWidth = 240,
  height = "100svh",
  className = "",
}: LanyardBadgeProps) {
  const strapInk = strapInkColor ?? "#f5e6b8";
  // Deep jewelry gold — amber/bronze, not pale yellow.
  const cardGold =
    "linear-gradient(155deg, #daa520 0%, #c99410 26%, #b8860b 52%, #9a7209 76%, #7a5a08 100%)";
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const flipRef = useRef(() => {});
  const [flipped, setFlipped] = useState(false);
  const [width, setWidth] = useState(cardWidth);
  const flippedRef = useRef(flipped);
  flippedRef.current = flipped;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const update = () => {
      const vw = window.innerWidth;
      const cw = root.clientWidth || vw;
      // Mobile: larger badge so it reads closer in the preview.
      const mobileCap = vw < 480 ? 252 : vw < 768 ? 256 : cardWidth;
      const next = Math.min(
        cardWidth,
        mobileCap,
        Math.max(196, Math.round(cw * (vw < 768 ? 0.72 : 0.48))),
      );
      setWidth((prev) => (prev === next ? prev : next));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(root);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [cardWidth]);

  const cardH = Math.round(width * 1.5);
  const ringR = Math.max(7, Math.round(width * 0.036));
  const clipH = Math.round(width * 0.1);
  const strapThemeRef = useRef({
    strapText,
    strapLabel,
    strapColor,
    inkColor: strapInk,
  });
  strapThemeRef.current = {
    strapText,
    strapLabel,
    strapColor,
    inkColor: strapInk,
  };
  const strapKey = [strapText, strapLabel, strapColor, strapInk].join("|");

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const badge = badgeRef.current;
    const card = cardRef.current;
    const ctx = canvas?.getContext("2d");
    if (!root || !canvas || !badge || !card || !ctx) return;

    const strapW = Math.max(14, Math.round(width * 0.1));
    const loopH = strapW * 2.2;
    const cardHang = ringR * 2 + clipH + cardH * 0.55;
    const segments = 14;

    let particles: Particle[] = [];
    let constraints: Constraint[] = [];
    let leftIds: number[] = [];
    let rightIds: number[] = [];
    let loopIds: number[] = [];
    let join = 0;
    let clip = 0;
    let tip = 0;
    let rest = 1;
    let dpr = 1;
    let viewW = 1;
    let viewH = 1;
    let strapTex: HTMLCanvasElement | null = null;
    let loopTex: HTMLCanvasElement | null = null;
    const spin = { a: 0, v: 0 };
    let targetSpin = flippedRef.current ? Math.PI : 0;
    spin.a = targetSpin;

    const add = (x: number, y: number, w: number) => {
      particles.push({ x, y, px: x, py: y, w });
      return particles.length - 1;
    };

    const chain = (a: number, b: number, count: number, stretch: number) => {
      const pa = particles[a];
      const pb = particles[b];
      const seg =
        (Math.hypot(pb.x - pa.x, pb.y - pa.y) * stretch) / count;
      const ids = [a];
      for (let i = 1; i < count; i++) {
        ids.push(
          add(
            pa.x + ((pb.x - pa.x) * i) / count,
            pa.y + ((pb.y - pa.y) * i) / count,
            1,
          ),
        );
      }
      ids.push(b);
      for (let i = 0; i < count; i++) constraints.push([ids[i], ids[i + 1], seg]);
      return { ids, rest: seg };
    };

    const layout = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      viewW = Math.max(1, root.clientWidth);
      viewH = Math.max(1, root.clientHeight);
      canvas.width = Math.round(viewW * dpr);
      canvas.height = Math.round(viewH * dpr);
      particles = [];
      constraints = [];

      const mid = viewW / 2;
      const narrow = viewW < 480;
      const spread = Math.min(viewW * (narrow ? 0.2 : 0.16), width * (narrow ? 0.62 : 0.55));
      const top = -strapW * 2;
      const hangY = Math.max(
        viewH * (narrow ? 0.1 : 0.14),
        Math.min(
          viewH * (narrow ? 0.36 : 0.42),
          viewH - (loopH + ringR * 2 + clipH + cardH) - (narrow ? 12 : 28),
        ),
      );

      const leftAnchor = add(mid - spread, top, 0);
      join = add(mid, hangY, 1.4);
      const left = chain(leftAnchor, join, segments, 1.03);
      const rightAnchor = add(mid + spread, top, 0);
      const right = chain(rightAnchor, join, segments, 1.03);
      clip = add(mid, hangY + loopH, 0.8);
      const loop = chain(join, clip, 3, 1);
      tip = add(mid, hangY + loopH + cardHang, 0.25);
      constraints.push([clip, tip, cardHang]);
      leftIds = left.ids;
      rightIds = right.ids;
      loopIds = loop.ids;
      rest = left.rest;

      const theme = strapThemeRef.current;
      const base = {
        color: theme.strapColor,
        ink: theme.inkColor,
        text: theme.strapText,
        label: theme.strapLabel,
      };
      strapTex = buildStrapTexture(rest * segments + 4, strapW, dpr, base);
      loopTex = buildStrapTexture(loopH + 4, strapW * 0.8, dpr, {
        ...base,
        plain: true,
      });

      if (reducedMotion) {
        for (let i = 0; i < 900; i++) {
          integrate(particles, DT, GRAVITY, 0.98);
          solveConstraints(particles, constraints, ITER);
        }
      } else {
        particles[tip].x += width * 0.55;
        particles[tip].px = particles[tip].x - 2;
        spin.v = 5;
      }
    };

    const DT = 1 / 120;
    const GRAVITY = 2400;
    const ITER = 18;

    const drawRibbon = (
      ids: number[],
      tex: HTMLCanvasElement,
      step: number,
      shade: number,
    ) => {
      const tw = tex.width;
      for (let i = 0; i < ids.length - 1; i++) {
        const a = particles[ids[i]];
        const b = particles[ids[i + 1]];
        const dx = (b.x - a.x) * dpr;
        const dy = (b.y - a.y) * dpr;
        const len = Math.hypot(dx, dy) || 1e-6;
        const ux = dx / len;
        const uy = dy / len;
        const px = uy;
        const py = -ux;
        const along = i * step * dpr;
        const seg = step * dpr;
        const stretch = len / seg;
        ctx.setTransform(
          px,
          py,
          ux * stretch,
          uy * stretch,
          a.x * dpr - (px * tw) / 2 - ux * stretch * along,
          a.y * dpr - (py * tw) / 2 - uy * stretch * along,
        );
        const slice = Math.min(seg + 1.5, tex.height - along);
        if (slice > 0) ctx.drawImage(tex, 0, along, tw, slice, 0, along, tw, slice);
        const alpha = 0.22 * (1 - Math.max(0, px * shade));
        ctx.fillStyle = `rgba(0,0,0,${alpha.toFixed(3)})`;
        ctx.fillRect(0, along, tw, seg + 1);
      }
    };

    const metal = (x0: number, y0: number, x1: number, y1: number) => {
      const g = ctx.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, "#f4efe4");
      g.addColorStop(0.45, "#b9b0a0");
      g.addColorStop(0.55, "#8f8778");
      g.addColorStop(1, "#ece6da");
      return g;
    };

    const paint = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!strapTex || !loopTex) return;
      ctx.imageSmoothingEnabled = true;
      drawRibbon(leftIds, strapTex, rest, -1);
      drawRibbon(rightIds, strapTex, rest, 1);
      drawRibbon(loopIds, loopTex, loopH / 3, 0);

      const a = particles[join];
      const b = particles[clip];
      const ang = Math.atan2(b.x - a.x, b.y - a.y);
      const s = strapW / 20;
      ctx.setTransform(dpr, 0, 0, dpr, a.x * dpr, a.y * dpr);
      ctx.rotate(-ang);
      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 6 * dpr;
      ctx.shadowOffsetY = 2 * dpr;
      ctx.fillStyle = metal(-16 * s, 0, 16 * s, 0);
      ctx.beginPath();
      ctx.roundRect(-15 * s, -14 * s, 30 * s, 17 * s, 3 * s);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(-11 * s, 1 * s, 22 * s, 15 * s, [
        2 * s,
        2 * s,
        6 * s,
        6 * s,
      ]);
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.fillStyle = "rgba(40,36,30,0.55)";
      ctx.fillRect(-10 * s, -9 * s, 20 * s, 2.2 * s);
      ctx.fillRect(-5 * s, 6 * s, 10 * s, 3 * s);
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 0.8 * s;
      ctx.beginPath();
      ctx.moveTo(-13 * s, -12.5 * s);
      ctx.lineTo(13 * s, -12.5 * s);
      ctx.stroke();

      ctx.setTransform(dpr, 0, 0, dpr, b.x * dpr, (b.y + ringR * 0.8) * dpr);
      ctx.lineWidth = Math.max(2.5, ringR * 0.38);
      ctx.strokeStyle = metal(-ringR, -ringR, ringR, ringR);
      ctx.beginPath();
      ctx.arc(0, 0, ringR, 0, Math.PI * 2);
      ctx.stroke();
    };

    const syncDom = () => {
      const a = particles[clip];
      const b = particles[tip];
      const ang = angleBetween(a, b);
      badge.style.transform = `translate3d(${(a.x - width / 2).toFixed(2)}px,${(a.y + ringR).toFixed(2)}px,0) rotate(${(-ang).toFixed(4)}rad)`;
      card.style.transform = `perspective(1100px) rotateY(${spin.a.toFixed(4)}rad)`;
      const dim = 1 - Math.abs(Math.cos(spin.a));
      card.style.setProperty("--lyd-dim", (dim * 0.5).toFixed(3));
      card.style.setProperty(
        "--lyd-shine",
        `${(50 + Math.sin(spin.a) * 70 + ang * 90).toFixed(1)}%`,
      );
    };

    type Drag = {
      id: number;
      ox: number;
      oy: number;
      tx: number;
      ty: number;
      sx: number;
      sy: number;
      moved: boolean;
    };
    let drag: Drag | null = null;

    const localPoint = (e: PointerEvent): [number, number] => {
      const rect = root.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top];
    };

    const flip = () => {
      targetSpin = targetSpin === 0 ? Math.PI : 0;
      setFlipped(targetSpin !== 0);
    };
    flipRef.current = flip;

    const onDown = (e: PointerEvent) => {
      if (e.button > 0) return;
      const [x, y] = localPoint(e);
      const p = particles[clip];
      drag = {
        id: e.pointerId,
        ox: p.x - x,
        oy: p.y - y,
        tx: p.x,
        ty: p.y,
        sx: x,
        sy: y,
        moved: false,
      };
      particles[clip].w = 0;
      badge.setPointerCapture(e.pointerId);
      badge.style.cursor = "grabbing";
    };

    const onMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const [x, y] = localPoint(e);
      drag.tx = x + drag.ox;
      drag.ty = y + drag.oy;
      if (Math.hypot(x - drag.sx, y - drag.sy) > 5) drag.moved = true;
    };

    const onUp = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.moved) flip();
      drag = null;
      particles[clip].w = 0.8;
      badge.style.cursor = "grab";
    };

    badge.addEventListener("pointerdown", onDown);
    badge.addEventListener("pointermove", onMove);
    badge.addEventListener("pointerup", onUp);
    badge.addEventListener("pointercancel", onUp);

    let raf = 0;
    let acc = 0;
    let last = performance.now();
    let time = 0;

    const tick = (now: number) => {
      acc += Math.min(0.05, (now - last) / 1000);
      last = now;
      let steps = 0;
      while (acc >= DT && steps < 8) {
        acc -= DT;
        steps++;
        time += DT;
        if (drag) {
          const p = particles[clip];
          p.px = p.x;
          p.py = p.y;
          p.x += (drag.tx - p.x) * 0.35;
          p.y += (drag.ty - p.y) * 0.35;
        }
        const tipP = particles[tip];
        if (!reducedMotion && !drag) {
          tipP.x +=
            (22 * Math.sin(time * 0.7) + 12 * Math.sin(time * 1.9)) * DT * DT;
        }
        integrate(particles, DT, GRAVITY, 0.992);
        solveConstraints(particles, constraints, ITER);
        const vx = (tipP.x - tipP.px) / DT;
        springAngle(
          spin,
          targetSpin,
          DT,
          vx * 0.03 + (reducedMotion ? 0 : 0.6 * Math.sin(time * 0.5)),
        );
      }
      paint();
      syncDom();
      raf = requestAnimationFrame(tick);
    };

    layout();
    paint();
    syncDom();
    raf = requestAnimationFrame(tick);

    const ro = new ResizeObserver(() => {
      if (
        Math.abs(root.clientWidth - viewW) < 1 &&
        Math.abs(root.clientHeight - viewH) < 1
      ) {
        return;
      }
      layout();
      paint();
      syncDom();
    });
    ro.observe(root);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      badge.removeEventListener("pointerdown", onDown);
      badge.removeEventListener("pointermove", onMove);
      badge.removeEventListener("pointerup", onUp);
      badge.removeEventListener("pointercancel", onUp);
    };
  }, [reducedMotion, width, cardH, ringR, clipH, strapKey]);

  const faceStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: width * 0.06,
    overflow: "hidden",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    boxShadow:
      "0 18px 40px -12px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.2)",
  };

  const shine = (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background:
          "linear-gradient(105deg, transparent 38%, rgba(255,236,170,0.22) 50%, transparent 62%) var(--lyd-shine, 50%) 0 / 250% 100% no-repeat, rgba(0,0,0,var(--lyd-dim, 0))",
      }}
    />
  );

  const slot = (
    <div
      aria-hidden
      style={{
        position: "absolute",
        top: width * 0.05,
        left: "50%",
        width: width * 0.2,
        height: width * 0.035,
        transform: "translateX(-50%)",
        borderRadius: 999,
        background: "rgba(0,0,0,0.28)",
        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
      }}
    />
  );

  const scale = width / 240;

  const defaultFront = (
    <div className="relative h-full w-full" style={{ background: cardGold, color: inkColor }}>
      <SealMark
        className="absolute"
        style={{
          width: 300 * scale,
          right: -130 * scale,
          top: 100 * scale,
          maxWidth: "none",
        }}
      />
      <SealMark
        className="absolute"
        style={{
          width: 210 * scale,
          left: -40 * scale,
          bottom: -70 * scale,
          maxWidth: "none",
          opacity: 0.8,
        }}
      />
      <ArrowMark
        className="absolute"
        style={{
          width: 14 * scale,
          height: 250 * scale,
          left: 26 * scale,
          top: 110 * scale,
          transform: "rotate(-14deg)",
          maxWidth: "none",
        }}
      />
      <div
        className="absolute"
        dir="rtl"
        style={{
          left: 22 * scale,
          top: 34 * scale,
          right: 22 * scale,
          fontFamily: PERSIAN_FONT,
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: 28 * scale,
            lineHeight: 1.15,
            letterSpacing: "0",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 9 * scale,
            marginTop: 8 * scale,
            fontWeight: 700,
            letterSpacing: "0",
            opacity: 1,
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );

  const defaultBack = (
    <div className="relative h-full w-full" style={{ background: cardGold }}>
      <SealMark
        className="absolute"
        style={{
          width: 150 * scale,
          right: -30 * scale,
          top: 30 * scale,
          color: inkColor,
          opacity: 0.6,
          maxWidth: "none",
        }}
      />
      <div
        className="absolute"
        dir="rtl"
        style={{
          left: 22 * scale,
          top: 70 * scale,
          color: strapColor,
          fontFamily: PERSIAN_FONT,
        }}
      >
        <SealMark style={{ width: 26 * scale, color: inkColor }} />
        <div
          style={{
            width: 16 * scale,
            height: 2 * scale,
            background: strapColor,
            margin: `${14 * scale}px 0 ${8 * scale}px`,
          }}
        />
        <div
          style={{
            fontWeight: 800,
            fontSize: 18 * scale,
            lineHeight: 1.2,
            letterSpacing: "0",
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: 9 * scale,
            marginTop: 4 * scale,
            fontWeight: 700,
            letterSpacing: "0",
            opacity: 1,
          }}
        >
          {role}
        </div>
      </div>
      <div
        className="absolute overflow-hidden"
        style={{
          left: 0,
          right: 0,
          bottom: 0,
          height: "44%",
          background: strapColor,
          borderTopLeftRadius: 40 * scale,
          color: cardColor,
        }}
      >
        <SealMark
          className="absolute"
          style={{
            width: 230 * scale,
            left: -20 * scale,
            top: -40 * scale,
            opacity: 0.85,
            maxWidth: "none",
          }}
        />
        <ArrowMark
          className="absolute"
          style={{
            width: 12 * scale,
            height: 220 * scale,
            left: 150 * scale,
            top: -40 * scale,
            transform: "rotate(62deg)",
            maxWidth: "none",
          }}
        />
      </div>
    </div>
  );

  return (
    <section
      ref={rootRef}
      className={`relative w-full overflow-hidden select-none font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal ${className}`.trim()}
      style={{ height }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          maxWidth: "none",
          display: "block",
          pointerEvents: "none",
        }}
      />
      <div
        ref={badgeRef}
        role="button"
        tabIndex={0}
        aria-label="بج. بکشید تا تاب بخورد، فشار دهید تا برگردد."
        aria-pressed={flipped}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            flipRef.current();
          }
        }}
        className="absolute left-0 top-0 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{
          width,
          height: cardH + ringR + clipH,
          transformOrigin: "50% 0",
          cursor: "grab",
          touchAction: "none",
          willChange: "transform",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            width: width * 0.075,
            height: clipH + width * 0.05,
            transform: "translateX(-50%)",
            borderRadius: width * 0.02,
            background: "linear-gradient(90deg, #f4efe4, #a8a090 50%, #ece6da)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.35)",
            zIndex: 2,
          }}
        />
        <div
          ref={cardRef}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: ringR + clipH * 0.6,
            height: cardH,
            transformStyle: "preserve-3d",
          }}
        >
          <div style={faceStyle}>
            {front ?? defaultFront}
            {slot}
            {shine}
          </div>
          <div style={{ ...faceStyle, transform: "rotateY(180deg)" }}>
            {back ?? defaultBack}
            {slot}
            {shine}
          </div>
        </div>
      </div>
      {flipButton ? (
        <button
          type="button"
          onClick={() => flipRef.current()}
          aria-pressed={flipped}
          className="absolute end-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:end-4 sm:top-4 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
        >
          <svg
            viewBox="0 0 24 24"
            width={16}
            height={16}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="transition-transform duration-500 motion-reduce:transition-none"
            style={{ transform: flipped ? "scaleX(-1)" : "none" }}
          >
            <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
          {flipped ? "نمایش رو" : "نمایش پشت"}
        </button>
      ) : null}
    </section>
  );
}

export default function LanyardBadgeDemo() {
  return (
    <div className="relative h-full min-h-[min(640px,80dvh)] w-full">
      <LanyardBadge
        height="100%"
        className="h-full w-full"
        cardWidth={256}
        cardColor="#b8860b"
        strapColor="#7a5c3e"
        strapInkColor="#f5e6b8"
        inkColor="#1f1406"
      />
    </div>
  );
}
