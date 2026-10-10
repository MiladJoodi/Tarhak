"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import type { BrowseItem } from "@/lib/browse/items";
const HOLD_MS = 3000;
const COLS = 5;
const ROWS = 5;
const CARD_W = 300;
const CARD_H = 268;
const FRAME_PAD = 6;
const MEDIA_W = CARD_W - FRAME_PAD * 2;
const DEFAULT_ASPECT = MEDIA_W / (CARD_H - FRAME_PAD * 2);
const GAP = 40;
const PAD = 36;

const SCALE_HOLD = 1.14;
const SCALE_OUT = 0.96;
const SCALE_HOLD_MOBILE = 0.82;
const SCALE_OUT_MOBILE = 0.72;
const CARD_SCALE_ACTIVE = 1.03;
const CARD_SCALE_ACTIVE_MOBILE = 1.05;
const MOBILE_MQ = "(max-width: 767px)";

/** Soft pull-back → glide → settle */
const OUT_MS = 560;
const MOVE_MS = 980;
const IN_MS = 720;

const easeOutSoft = [0.22, 1, 0.36, 1] as [number, number, number, number];
const easeInSoft = [0.4, 0, 0.7, 0.2] as [number, number, number, number];
const easeInOutSoft = [0.4, 0, 0.2, 1] as [number, number, number, number];

function holdScale(mobile: boolean) {
  return mobile ? SCALE_HOLD_MOBILE : SCALE_HOLD;
}
function outScale(mobile: boolean) {
  return mobile ? SCALE_OUT_MOBILE : SCALE_OUT;
}
function activeCardScale(mobile: boolean) {
  return mobile ? CARD_SCALE_ACTIVE_MOBILE : CARD_SCALE_ACTIVE;
}

const spotlightShadow = [
  "0 12px 28px rgba(0,0,0,0.18)",
  "0 40px 56px rgba(0,0,0,0.14)",
  "0 90px 72px rgba(0,0,0,0.08)",
  "0 0 0 1px rgba(255,255,255,0.12)",
].join(", ");

const glassBg = "rgba(255, 255, 255, 0.16)";
const glassBgActive = "rgba(255, 255, 255, 0.3)";

const FIELD_MASK = "url(/landing/hero-canvas-mask.svg)";
const FIELD_MASK_SIDES =
  "linear-gradient(90deg, transparent 0%, black 9%, black 91%, transparent 100%)";
const FIELD_MASK_MOBILE =
  "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.35) 10%, black 28%, black 100%)";
const MOBILE_SEAM_WASH =
  "linear-gradient(180deg, rgba(146,148,190,0.72) 0%, rgba(120,130,175,0.35) 45%, transparent 100%)";

const canvasW = PAD * 2 + COLS * CARD_W + (COLS - 1) * GAP;
const TOTAL = COLS * ROWS;
const DECK_SOURCE_COUNT = 12;

type Camera = { x: number; y: number; scale: number };
type DeckCard = BrowseItem & { key: string };
type CardBox = { left: number; top: number; width: number; height: number };

function cardHeightForAspect(aspect: number) {
  const ratio = aspect > 0 ? aspect : DEFAULT_ASPECT;
  return FRAME_PAD * 2 + MEDIA_W / ratio;
}

function layoutDeck(count: number, aspectOf: (index: number) => number) {
  const colY = Array.from({ length: COLS }, () => PAD);
  const rects: CardBox[] = [];
  for (let i = 0; i < count; i++) {
    const col = i % COLS;
    const height = cardHeightForAspect(aspectOf(i));
    rects.push({
      left: PAD + col * (CARD_W + GAP),
      top: colY[col]!,
      width: CARD_W,
      height,
    });
    colY[col]! += height + GAP;
  }
  return {
    rects,
    canvasH: Math.max(...colY, PAD) + PAD - GAP,
  };
}

function rectAt(rects: CardBox[], index: number): CardBox {
  return rects[index] ?? { left: PAD, top: PAD, width: CARD_W, height: CARD_H };
}

function cameraFor(rect: CardBox, viewW: number, viewH: number, scale: number): Camera {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  return {
    x: viewW / 2 - cx * scale,
    y: viewH / 2 - cy * scale,
    scale,
  };
}

function isInterior(index: number) {
  const col = index % COLS;
  const row = Math.floor(index / COLS);
  return col > 0 && col < COLS - 1 && row > 0 && row < ROWS - 1;
}

function manhattan(a: number, b: number) {
  return (
    Math.abs((a % COLS) - (b % COLS)) +
    Math.abs(Math.floor(a / COLS) - Math.floor(b / COLS))
  );
}

function fieldDepth(index: number, spotlight: number) {
  const d = manhattan(index, spotlight);
  if (d <= 1) return { opacity: 0.95, scale: 1, blur: 0 };
  if (d === 2) return { opacity: 0.78, scale: 0.99, blur: 0 };
  if (d === 3) return { opacity: 0.58, scale: 0.98, blur: 0.3 };
  return { opacity: 0.4, scale: 0.97, blur: 0.5 };
}

function firstInteriorIndex() {
  for (let i = 0; i < TOTAL; i++) if (isInterior(i)) return i;
  return 0;
}

const START_INDEX = firstInteriorIndex();

/** Interior cells, START_INDEX first, then nearest — matches early camera tour. */
function priorityInteriorPath(): number[] {
  const interiors: number[] = [];
  for (let i = 0; i < TOTAL; i++) if (isInterior(i)) interiors.push(i);
  const startCol = START_INDEX % COLS;
  const startRow = Math.floor(START_INDEX / COLS);
  return interiors.sort((a, b) => {
    if (a === START_INDEX) return -1;
    if (b === START_INDEX) return 1;
    const da =
      Math.abs((a % COLS) - startCol) + Math.abs(Math.floor(a / COLS) - startRow);
    const db =
      Math.abs((b % COLS) - startCol) + Math.abs(Math.floor(b / COLS) - startRow);
    return da - db || a - b;
  });
}

const PRIORITY_PATH = priorityInteriorPath();

function buildDeck(items: BrowseItem[]): DeckCard[] {
  if (items.length === 0) return [];
  const pool = [...items];
  const deck: DeckCard[] = [];
  let cursor = 0;

  for (let i = 0; i < TOTAL; i++) {
    const prev = deck[i - 1]?.slug;
    const above = i >= COLS ? deck[i - COLS]?.slug : undefined;
    let pick: BrowseItem | undefined;

    for (let attempt = 0; attempt < pool.length; attempt++) {
      const candidate = pool[(cursor + attempt) % pool.length]!;
      if (candidate.slug === prev || candidate.slug === above) continue;
      pick = candidate;
      cursor = (cursor + attempt + 1) % pool.length;
      break;
    }

    if (!pick) {
      pick = pool[cursor % pool.length]!;
      cursor = (cursor + 1) % pool.length;
    }

    deck.push({ ...pick, key: `${pick.slug}-${i}` });
  }

  // Pin config order onto the first spotlight cells so /v1 opens on slug[0], then [1]…
  const path = PRIORITY_PATH;
  for (let p = 0; p < Math.min(items.length, path.length); p++) {
    const idx = path[p]!;
    const item = items[p]!;
    deck[idx] = { ...item, key: `${item.slug}-${idx}` };
  }

  return deck;
}

function nextSpotlightIndex(
  current: number,
  cards: DeckCard[],
  recentSlugs: readonly string[],
  priorityStep?: number,
) {
  // First tour: walk priority path in landing-hero.json order.
  if (
    typeof priorityStep === "number" &&
    priorityStep >= 0 &&
    priorityStep < PRIORITY_PATH.length
  ) {
    const target = PRIORITY_PATH[priorityStep]!;
    if (target !== current && isInterior(target)) return target;
  }

  const count = cards.length;
  if (count <= 1) return 0;
  const currentSlug = cards[current]?.slug;
  const curCol = current % COLS;
  const curRow = Math.floor(current / COLS);
  // Prefer a short glide to a neighbor — long jumps feel abrupt.
  const ranked = Array.from({ length: count }, (_, i) => i)
    .filter((i) => i !== current && isInterior(i))
    .map((i) => {
      const dist =
        Math.abs((i % COLS) - curCol) + Math.abs(Math.floor(i / COLS) - curRow);
      const slug = cards[i]!.slug;
      const sameAsCurrent = slug === currentSlug ? 1 : 0;
      const recentPenalty = recentSlugs.includes(slug) ? 2 : 0;
      const nearBonus = dist <= 2 ? 3 : dist <= 3 ? 1 : 0;
      return {
        i,
        dist,
        score: nearBonus * 4 - dist - sameAsCurrent * 10 - recentPenalty * 4,
      };
    })
    .sort((a, b) => b.score - a.score || a.dist - b.dist);

  const pool = ranked.length
    ? ranked
    : Array.from({ length: count }, (_, i) => ({ i, dist: 1, score: 1 })).filter(
        (r) => r.i !== current,
      );
  const fresh = pool.filter((r) => cards[r.i]?.slug !== currentSlug);
  const pick = fresh.length ? fresh : pool;
  const top = pick.slice(0, Math.min(3, pick.length));
  return top[Math.floor(Math.random() * top.length)]!.i;
}

/** Start hero video soon — don't wait for a long idle window. */
function deferVideoStart(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  let idleId = 0;
  let timeoutId = 0;
  const run = () => cb();

  const schedule = () => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof w.requestIdleCallback === "function") {
      idleId = w.requestIdleCallback(run, { timeout: 280 });
    } else {
      timeoutId = window.setTimeout(run, 120);
    }
  };

  if (document.readyState === "complete") schedule();
  else {
    timeoutId = window.setTimeout(run, 180);
    window.addEventListener("load", schedule, { once: true });
  }

  return () => {
    window.removeEventListener("load", schedule);
    const w = window as Window & { cancelIdleCallback?: (id: number) => void };
    if (idleId && typeof w.cancelIdleCallback === "function") w.cancelIdleCallback(idleId);
    if (timeoutId) window.clearTimeout(timeoutId);
  };
}

function StageCard({
  item,
  active,
  allowVideo,
  warmVideo = false,
  reducedMotion,
  left,
  top,
  height,
  aspect,
  depth,
  activeScale = CARD_SCALE_ACTIVE,
}: {
  item: BrowseItem;
  active: boolean;
  allowVideo: boolean;
  /** Prefetch + decode before this card becomes spotlight. */
  warmVideo?: boolean;
  reducedMotion: boolean;
  left: number;
  top: number;
  height: number;
  aspect: number;
  depth: { opacity: number; scale: number; blur: number };
  activeScale?: number;
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const wantsVideo = Boolean(item.video) && (allowVideo || warmVideo);
  const [holdVideo, setHoldVideo] = React.useState(false);
  const mountVideo = wantsVideo && (active || holdVideo || warmVideo);
  const showVideo = allowVideo && (active || holdVideo);
  const [videoReady, setVideoReady] = React.useState(false);

  React.useEffect(() => {
    if (active && allowVideo) {
      setHoldVideo(true);
      return;
    }
    if (!active && holdVideo) {
      const id = window.setTimeout(() => setHoldVideo(false), 900);
      return () => window.clearTimeout(id);
    }
  }, [active, allowVideo, holdVideo]);

  React.useEffect(() => {
    if (!mountVideo) setVideoReady(false);
  }, [item.video, mountVideo]);

  React.useEffect(() => {
    const node = videoRef.current;
    if (!node || !mountVideo) return;

    const markReady = () => {
      if (node.readyState >= 2) setVideoReady(true);
    };

    markReady();
    node.addEventListener("loadeddata", markReady);
    node.addEventListener("canplay", markReady);
    node.addEventListener("playing", markReady);

    if (showVideo) {
      void node.play().catch(() => {});
    } else {
      node.pause();
      try {
        node.currentTime = 0;
      } catch {
        /* ignore seek before load */
      }
    }

    return () => {
      node.removeEventListener("loadeddata", markReady);
      node.removeEventListener("canplay", markReady);
      node.removeEventListener("playing", markReady);
      if (!showVideo) node.pause();
    };
  }, [mountVideo, item.video, showVideo]);

  return (
    <motion.figure
      className={cn(
        "absolute flex overflow-hidden rounded-[14px] p-1.5",
        active && "z-20",
      )}
      style={{
        left,
        top,
        width: CARD_W,
        height,
        background: active ? glassBgActive : glassBg,
        border: active
          ? "1px solid rgba(255,255,255,0.55)"
          : "1px solid rgba(255,255,255,0.14)",
        boxShadow: active ? spotlightShadow : "0 10px 24px rgba(0,0,0,0.1)",
        backdropFilter: active ? "blur(28px) saturate(1.6)" : "blur(10px) saturate(1.2)",
        WebkitBackdropFilter: active
          ? "blur(28px) saturate(1.6)"
          : "blur(10px) saturate(1.2)",
        filter: active || reducedMotion || depth.blur <= 0
          ? undefined
          : `blur(${depth.blur}px)`,
      }}
      animate={
        reducedMotion
          ? { opacity: 1, scale: 1 }
          : {
              opacity: active ? 1 : depth.opacity,
              scale: active ? activeScale : depth.scale,
            }
      }
      transition={
        reducedMotion
          ? { duration: 0 }
          : {
              type: "spring",
              stiffness: active ? 180 : 140,
              damping: active ? 28 : 30,
              mass: 1.15,
            }
      }
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[14px]"
        style={{
          boxShadow: active
            ? "inset 0 1.5px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(255,255,255,0.08)"
            : "inset 0 1px 0 rgba(255,255,255,0.18)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[42%] rounded-t-[14px]"
        style={{
          background: active
            ? "linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.08) 42%, transparent 100%)"
            : "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 70%)",
          mixBlendMode: "soft-light",
        }}
      />

      <div
        className="relative z-[1] w-full flex-1 overflow-clip rounded-[11px] bg-[#14151c] [transform:translateZ(0)]"
        style={{ aspectRatio: aspect }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- local posters; sized by aspect box. */}
        <img
          src={item.poster}
          alt=""
          loading="eager"
          decoding="async"
          className="absolute inset-0 size-full rounded-[11px] object-cover"
          draggable={false}
        />
        {mountVideo ? (
          <video
            ref={videoRef}
            src={item.video}
            muted
            loop
            playsInline
            preload="auto"
            className={cn(
              "absolute inset-0 size-full rounded-[11px] object-cover transition-opacity duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              showVideo && videoReady ? "opacity-100" : "opacity-0",
            )}
            draggable={false}
          />
        ) : null}
      </div>
    </motion.figure>
  );
}

export function HeroStageCanvas({ items }: { items: BrowseItem[] }) {
  const deckItems = React.useMemo(
    () => items.slice(0, DECK_SOURCE_COUNT),
    [items],
  );
  const cards = React.useMemo(() => buildDeck(deckItems), [deckItems]);
  const reducedMotion = useReducedMotion() ?? false;
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const [spotlight, setSpotlight] = React.useState(START_INDEX);
  /** Next card index while the camera is gliding — used to prefetch its video. */
  const [upcoming, setUpcoming] = React.useState<number | null>(null);
  const [videosReady, setVideosReady] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const [holding, setHolding] = React.useState(true);
  const [view, setView] = React.useState({ w: 800, h: 900 });
  // Fixed cell aspect — per-poster ratios reflow the masonry and snap the camera
  // on the first→second handoff. Cover-crop inside the frame instead.
  const layout = React.useMemo(
    () => layoutDeck(cards.length, () => DEFAULT_ASPECT),
    [cards.length],
  );
  const layoutRef = React.useRef(layout);
  const [camera, setCamera] = React.useState<Camera>(() =>
    cameraFor(
      rectAt(layoutDeck(TOTAL, () => DEFAULT_ASPECT).rects, START_INDEX),
      800,
      900,
      SCALE_HOLD,
    ),
  );
  const [transition, setTransition] = React.useState({
    duration: 0,
    ease: easeOutSoft,
  });
  const spotlightRef = React.useRef(START_INDEX);
  const viewRef = React.useRef(view);
  const scaleRef = React.useRef(SCALE_HOLD);
  const holdRef = React.useRef(SCALE_HOLD);
  const outRef = React.useRef(SCALE_OUT);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    layoutRef.current = layout;
  }, [layout]);

  React.useEffect(() => {
    spotlightRef.current = spotlight;
  }, [spotlight]);

  React.useEffect(() => {
    viewRef.current = view;
  }, [view]);

  React.useEffect(() => {
    scaleRef.current = camera.scale;
  }, [camera.scale]);

  React.useEffect(() => deferVideoStart(() => setVideosReady(true)), []);

  // Prefetch first hero clips early so the opening animation isn't late.
  React.useEffect(() => {
    if (!videosReady) return;
    const warmers: HTMLVideoElement[] = [];
    const priority = deckItems.slice(0, 4);
    for (const item of priority) {
      if (!item.video) continue;
      const node = document.createElement("video");
      node.muted = true;
      node.playsInline = true;
      node.preload = "auto";
      node.src = item.video;
      warmers.push(node);
    }
    return () => {
      for (const node of warmers) {
        node.removeAttribute("src");
        node.load();
      }
    };
  }, [videosReady, deckItems]);

  React.useEffect(() => {
    if (!ready) return;
    // Soft settle only — never hard-snap when layout identity refreshes.
    const { w, h } = viewRef.current;
    setTransition({ duration: 0.55, ease: easeOutSoft });
    setCamera(
      cameraFor(rectAt(layout.rects, spotlightRef.current), w, h, scaleRef.current),
    );
  }, [layout, ready]);

  // Warm the second spotlight clip during the opening hold (first→second was jumpy).
  React.useEffect(() => {
    if (!ready || !videosReady) return;
    const second = PRIORITY_PATH[1];
    if (typeof second === "number" && second !== START_INDEX) {
      setUpcoming(second);
    }
  }, [ready, videosReady]);

  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const mq = window.matchMedia(MOBILE_MQ);
    const syncBreakpoint = () => {
      const mobile = mq.matches;
      setIsMobile(mobile);
      holdRef.current = holdScale(mobile);
      outRef.current = outScale(mobile);
    };
    syncBreakpoint();

    const apply = (w: number, h: number, first: boolean) => {
      if (w < 1 || h < 1) return;
      syncBreakpoint();
      setView({ w, h });
      setTransition({ duration: 0, ease: [0, 0, 1, 1] });
      const scale =
        first ||
        scaleRef.current === SCALE_HOLD ||
        scaleRef.current === SCALE_HOLD_MOBILE
          ? holdRef.current
          : scaleRef.current;
      setCamera(
        cameraFor(rectAt(layoutRef.current.rects, spotlightRef.current), w, h, scale),
      );
      if (first) setReady(true);
    };

    apply(el.clientWidth, el.clientHeight, true);
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry!.contentRect;
      apply(width, height, false);
    });
    const onMq = () => apply(el.clientWidth, el.clientHeight, false);
    ro.observe(el);
    mq.addEventListener("change", onMq);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", onMq);
    };
  }, []);

  React.useEffect(() => {
    if (!ready || cards.length <= 1 || reducedMotion) return;

    let cancelled = false;
    let timer = 0;
    let priorityStep = 1; // START_INDEX already shows items[0]
    const recentSlugs: string[] = [];

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = window.setTimeout(resolve, ms);
      });

    const remember = (index: number) => {
      const slug = cards[index]?.slug;
      if (!slug) return;
      recentSlugs.push(slug);
      if (recentSlugs.length > 4) recentSlugs.shift();
    };

    remember(spotlightRef.current);

    const cycle = async () => {
      const { w, h } = viewRef.current;
      const current = spotlightRef.current;
      const next = nextSpotlightIndex(current, cards, recentSlugs, priorityStep);
      if (priorityStep < PRIORITY_PATH.length) priorityStep += 1;
      remember(next);
      setUpcoming(next);
      const out = outRef.current;
      const hold = holdRef.current;

      // Leave current clip playing, pull back, glide to the next poster…
      setHolding(false);
      setTransition({ duration: OUT_MS / 1000, ease: easeInSoft });
      setCamera(cameraFor(rectAt(layoutRef.current.rects, current), w, h, out));
      await wait(OUT_MS);
      if (cancelled) return;

      setTransition({ duration: MOVE_MS / 1000, ease: easeInOutSoft });
      setCamera(cameraFor(rectAt(layoutRef.current.rects, next), w, h, out));
      // Arrive on the poster first; promote + start video near the end of the glide.
      const promoteIn = Math.round(MOVE_MS * 0.72);
      await wait(promoteIn);
      if (cancelled) return;

      setSpotlight(next);
      setUpcoming(null);
      await wait(MOVE_MS - promoteIn);
      if (cancelled) return;

      setTransition({ duration: IN_MS / 1000, ease: easeOutSoft });
      setCamera(cameraFor(rectAt(layoutRef.current.rects, next), w, h, hold));
      await wait(IN_MS);
      if (cancelled) return;

      setHolding(true);
      timer = window.setTimeout(() => {
        void cycle();
      }, HOLD_MS);
    };

    timer = window.setTimeout(() => {
      void cycle();
    }, HOLD_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [ready, cards, reducedMotion]);

  React.useEffect(() => {
    if (!ready || !reducedMotion || cards.length <= 1) return;
    let priorityStep = 1;
    const recentSlugs: string[] = [];
    const id = window.setInterval(() => {
      const next = nextSpotlightIndex(
        spotlightRef.current,
        cards,
        recentSlugs,
        priorityStep,
      );
      if (priorityStep < PRIORITY_PATH.length) priorityStep += 1;
      const slug = cards[next]?.slug;
      if (slug) {
        recentSlugs.push(slug);
        if (recentSlugs.length > 4) recentSlugs.shift();
      }
      const { w, h } = viewRef.current;
      setSpotlight(next);
      setTransition({ duration: 0, ease: [0, 0, 1, 1] });
      setCamera(
        cameraFor(rectAt(layoutRef.current.rects, next), w, h, holdRef.current),
      );
    }, HOLD_MS);
    return () => window.clearInterval(id);
  }, [ready, cards, reducedMotion]);

  if (cards.length === 0) return null;

  const active = cards[spotlight];
  const activeRect = rectAt(layout.rects, spotlight);
  const breath = !reducedMotion && holding && ready;
  const cameraMotion = {
    x: camera.x,
    y: camera.y,
    scale: camera.scale,
  };
  const cameraTransition = reducedMotion ? { duration: 0 } : transition;
  const stageStyle = {
    width: canvasW,
    height: layout.canvasH,
    transformOrigin: "0px 0px" as const,
    visibility: (ready ? "visible" : "hidden") as "visible" | "hidden",
  };

  return (
    <div
      ref={viewportRef}
      className="pointer-events-none absolute inset-x-0 bottom-[5%] h-[54%] min-h-[220px] overflow-hidden max-md:[mask-image:var(--hero-field-mask-mobile),var(--hero-field-mask-sides)] max-md:[-webkit-mask-image:var(--hero-field-mask-mobile),var(--hero-field-mask-sides)] md:inset-y-0 md:left-0 md:right-auto md:h-auto md:min-h-0 md:w-[66%] md:[mask-image:var(--hero-field-mask-sides)] md:[-webkit-mask-image:var(--hero-field-mask-sides)]"
      style={
        {
          "--hero-field-mask-mobile": FIELD_MASK_MOBILE,
          "--hero-field-mask-sides": FIELD_MASK_SIDES,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
          WebkitMaskComposite: "source-in",
          maskComposite: "intersect",
        } as React.CSSProperties
      }
      aria-hidden
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 md:hidden"
        style={{ backgroundImage: MOBILE_SEAM_WASH }}
      />

      <motion.div
        className="absolute inset-0"
        animate={
          breath
            ? { x: [0, 3, -2, 0], y: [0, -2.5, 1.5, 0] }
            : { x: 0, y: 0 }
        }
        transition={
          breath
            ? { duration: 7.5, ease: "easeInOut", repeat: Infinity }
            : { duration: 0.7, ease: easeOutSoft }
        }
      >
        <div
          className="absolute inset-0 md:[mask-image:var(--hero-field-mask)] md:[-webkit-mask-image:var(--hero-field-mask)]"
          style={
            {
              "--hero-field-mask": FIELD_MASK,
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              WebkitMaskPosition: "center",
              maskPosition: "center",
            } as React.CSSProperties
          }
        >
          <motion.div
            className="absolute top-0 left-0 transform-gpu will-change-transform"
            style={stageStyle}
            animate={cameraMotion}
            transition={cameraTransition}
          >
            {cards.map((item, index) => {
              if (index === spotlight) return null;
              const rect = rectAt(layout.rects, index);
              return (
                <StageCard
                  key={item.key}
                  item={item}
                  active={false}
                  allowVideo={false}
                  warmVideo={videosReady && upcoming === index}
                  reducedMotion={reducedMotion}
                  left={rect.left}
                  top={rect.top}
                  height={rect.height}
                  aspect={DEFAULT_ASPECT}
                  depth={fieldDepth(index, spotlight)}
                />
              );
            })}
          </motion.div>
        </div>

        <div className="absolute inset-0">
          <motion.div
            className="absolute top-0 left-0 transform-gpu will-change-transform"
            style={stageStyle}
            animate={cameraMotion}
            transition={cameraTransition}
          >
            {active ? (
              <StageCard
                key={active.key}
                item={active}
                active
                allowVideo={videosReady}
                reducedMotion={reducedMotion}
                left={activeRect.left}
                top={activeRect.top}
                height={activeRect.height}
                aspect={DEFAULT_ASPECT}
                depth={{ opacity: 1, scale: 1, blur: 0 }}
                activeScale={activeCardScale(isMobile)}
              />
            ) : null}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
