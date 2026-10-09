"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useId, useRef, useState } from "react";

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

function toFaDigits(value: string | number) {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)] ?? d);
}

const REWARD = 50;
const COIN_COUNT = 14;

type Flight = {
  id: number;
  dx: number;
  dy: number;
  delay: number;
  spin: number;
};

function CoinGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <ellipse cx="20" cy="21" rx="15" ry="15" fill="#854d0e" opacity="0.35" />
      <circle cx="20" cy="19" r="15" fill="#facc15" stroke="#78350f" strokeWidth="1.5" />
      <circle cx="20" cy="17.5" r="15" fill="#fde047" opacity="0.55" />
      <circle
        cx="20"
        cy="19"
        r="11"
        fill="none"
        stroke="#fef9c3"
        strokeWidth="1.2"
        opacity="0.75"
      />
      <text
        x="20"
        y="23"
        textAnchor="middle"
        fontSize="12"
        fontWeight="800"
        fill="#713f12"
      >
        $
      </text>
    </svg>
  );
}

function GiftBox({ open, uid }: { open: boolean; uid: string }) {
  return (
    <div className="relative mx-auto size-[140px] md:size-[160px]">
      {/* glow */}
      <motion.span
        aria-hidden
        className="absolute inset-[-18%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(250,204,21,0.35) 0%, transparent 65%)",
        }}
        animate={
          open
            ? { opacity: [0.5, 1, 0.4], scale: [0.9, 1.15, 1] }
            : { opacity: 0.55, scale: 1 }
        }
        transition={{ duration: 0.9, ease: "easeOut" }}
      />

      <svg viewBox="0 0 160 160" className="relative size-full drop-shadow-2xl">
        <defs>
          <linearGradient id={`${uid}-box`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="55%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#a16207" />
          </linearGradient>
          <linearGradient id={`${uid}-lid`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
          <linearGradient id={`${uid}-ribbon`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="50%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#9f1239" />
          </linearGradient>
        </defs>

        {/* box body */}
        <motion.g
          animate={open ? { y: 6, scale: 0.98 } : { y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
          style={{ transformOrigin: "80px 100px" }}
        >
          <rect
            x="28"
            y="72"
            width="104"
            height="70"
            rx="10"
            fill={`url(#${uid}-box)`}
            stroke="#78350f"
            strokeWidth="2"
          />
          {/* vertical ribbon */}
          <rect x="70" y="72" width="20" height="70" fill={`url(#${uid}-ribbon)`} />
          {/* shine */}
          <path
            d="M36 80 Q50 95 36 130"
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </motion.g>

        {/* lid */}
        <motion.g
          animate={
            open
              ? { y: -28, rotate: -18, x: -8 }
              : { y: 0, rotate: 0, x: 0 }
          }
          transition={{ type: "spring", stiffness: 280, damping: 16 }}
          style={{ transformOrigin: "80px 72px" }}
        >
          <rect
            x="22"
            y="48"
            width="116"
            height="32"
            rx="8"
            fill={`url(#${uid}-lid)`}
            stroke="#78350f"
            strokeWidth="2"
          />
          <rect x="70" y="48" width="20" height="32" fill={`url(#${uid}-ribbon)`} />
          {/* bow */}
          <ellipse cx="58" cy="44" rx="16" ry="10" fill={`url(#${uid}-ribbon)`} />
          <ellipse cx="102" cy="44" rx="16" ry="10" fill={`url(#${uid}-ribbon)`} />
          <circle cx="80" cy="46" r="8" fill="#be123c" stroke="#9f1239" strokeWidth="1" />
        </motion.g>
      </svg>

      {/* sparkles when open */}
      <AnimatePresence>
        {open
          ? Array.from({ length: 8 }).map((_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return (
                <motion.span
                  key={i}
                  className="pointer-events-none absolute left-1/2 top-1/2 size-2 rounded-full bg-amber-200"
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: Math.cos(a) * 70,
                    y: Math.sin(a) * 56,
                    scale: [0, 1.4, 0],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.75, ease: "easeOut" }}
                  style={{ boxShadow: "0 0 10px rgba(250,204,21,0.9)" }}
                />
              );
            })
          : null}
      </AnimatePresence>
    </div>
  );
}

export function PrizeCoinsForm() {
  const uid = useId().replace(/:/g, "");
  const reduceMotion = useReducedMotion() ?? false;
  const stageRef = useRef<HTMLDivElement>(null);
  const giftRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);

  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [pop, setPop] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [target, setTarget] = useState({ x: 0, y: 0 });

  const claim = useCallback(() => {
    if (busy) return;
    const stage = stageRef.current?.getBoundingClientRect();
    const gift = giftRef.current?.getBoundingClientRect();
    const counter = counterRef.current?.getBoundingClientRect();
    if (!stage || !gift || !counter) return;

    const ox = gift.left + gift.width / 2 - stage.left;
    const oy = gift.top + gift.height / 2 - stage.top;
    const tx = counter.left + counter.width / 2 - stage.left;
    const ty = counter.top + counter.height / 2 - stage.top;

    setOrigin({ x: ox, y: oy });
    setTarget({ x: tx, y: ty });
    setBusy(true);
    setOpen(true);
    setPop(false);

    const next: Flight[] = Array.from({ length: COIN_COUNT }, (_, i) => ({
      id: Date.now() + i,
      dx: (Math.random() - 0.5) * 120,
      dy: -40 - Math.random() * 90,
      delay: reduceMotion ? 0 : i * 0.045,
      spin: (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 220),
    }));
    setFlights(next);

    const flyMs = reduceMotion ? 400 : 1100;
    const staggerMs = reduceMotion ? 0 : COIN_COUNT * 45;

    window.setTimeout(() => {
      setTotal((t) => t + REWARD);
      setPop(true);
      window.setTimeout(() => setPop(false), 500);
    }, flyMs + staggerMs * 0.35);

    window.setTimeout(() => {
      setFlights([]);
      setOpen(false);
      setBusy(false);
    }, flyMs + staggerMs + 280);
  }, [busy, reduceMotion]);

  return (
    <section
      aria-label="دریافت جایزه"
      className="relative w-full max-w-[420px]"
      dir="rtl"
      lang="fa"
    >
      <div
        ref={stageRef}
        className="relative overflow-hidden rounded-[32px] bg-[radial-gradient(120%_90%_at_50%_0%,#fffbeb_0%,#f8fafc_45%,#f1f5f9_100%)] px-5 pb-8 pt-5 shadow-[0_28px_56px_rgba(15,23,42,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-slate-900/6 md:px-7 md:pb-9 md:pt-6 dark:bg-[radial-gradient(120%_90%_at_50%_0%,#1e1b4b_0%,#0f172a_45%,#020617_100%)] dark:shadow-[0_36px_64px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] dark:ring-white/8"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-90 dark:opacity-80"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 12%, rgba(250,204,21,0.22), transparent 35%), radial-gradient(circle at 20% 80%, rgba(244,63,94,0.1), transparent 40%)",
          }}
        />

        {/* coin counter — گوشه بالا */}
        <motion.div
          ref={counterRef}
          className="absolute start-4 top-4 z-20 flex items-center gap-2 rounded-full bg-gradient-to-br from-amber-200/55 to-amber-600/25 px-3 py-1.5 shadow-[0_0_0_1px_rgba(180,83,9,0.22),0_8px_20px_rgba(15,23,42,0.08)] md:start-5 md:top-5 dark:from-amber-300/20 dark:to-amber-800/35 dark:shadow-[0_0_0_1px_rgba(250,204,21,0.35),0_8px_24px_rgba(0,0,0,0.35)]"
          animate={pop ? { scale: [1, 1.12, 1] } : { scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <CoinGlyph className="size-7" />
          <div className="leading-none">
            <p className="text-[10px] font-medium text-amber-800/70 dark:text-amber-200/70">
              موجودی
            </p>
            <p className="mt-0.5 text-[18px] font-black tabular-nums text-amber-950 dark:text-amber-50">
              {toFaDigits(total)}
            </p>
          </div>
          <AnimatePresence>
            {pop ? (
              <motion.span
                key="plus"
                className="absolute -bottom-5 start-1/2 -translate-x-1/2 text-[12px] font-bold text-amber-700 dark:text-amber-300"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
              >
                +{toFaDigits(REWARD)}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </motion.div>

        <div className="relative mt-10 text-center md:mt-12">
          <p className="text-[11px] font-bold tracking-[0.18em] text-amber-700/80 dark:text-amber-200/75">
            REWARD
          </p>
          <h2 className="mt-1 text-[22px] font-black text-slate-900 md:text-[26px] dark:text-amber-50">
            دریافت جایزه
          </h2>
          <p className="mt-1.5 text-[13px] text-slate-500 dark:text-slate-400">
            جعبه را باز کن؛ سکه‌ها جمع می‌شوند
          </p>
        </div>

        <div ref={giftRef} className="relative mt-6 flex justify-center py-2">
          <GiftBox open={open} uid={uid} />
        </div>

        <div className="relative mt-5 flex justify-center">
          <motion.button
            type="button"
            onClick={claim}
            disabled={busy}
            whileTap={busy || reduceMotion ? undefined : { scale: 0.97 }}
            className="rounded-full px-8 py-3 text-[15px] font-black text-amber-950 disabled:cursor-wait disabled:opacity-70"
            style={{
              background:
                "linear-gradient(180deg, #fef08a 0%, #eab308 48%, #ca8a04 100%)",
              boxShadow:
                "0 0 0 1px rgba(253,224,71,0.45), 0 12px 28px rgba(234,179,8,0.35), inset 0 1px 0 rgba(255,255,255,0.5)",
            }}
          >
            {busy ? "در حال دریافت…" : "دریافت جایزه"}
          </motion.button>
        </div>

        {/* flying coins layer */}
        <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
          <AnimatePresence>
            {flights.map((c) => (
              <motion.div
                key={c.id}
                className="absolute size-9 md:size-10"
                style={{ left: 0, top: 0, marginLeft: -18, marginTop: -18 }}
                initial={{
                  x: origin.x,
                  y: origin.y,
                  scale: 0.2,
                  opacity: 0,
                  rotate: 0,
                }}
                animate={
                  reduceMotion
                    ? {
                        x: target.x,
                        y: target.y,
                        scale: [0.4, 0.5],
                        opacity: [0, 1, 0],
                      }
                    : {
                        x: [origin.x, origin.x + c.dx, target.x],
                        y: [origin.y, origin.y + c.dy, target.y],
                        scale: [0.25, 1.15, 0.35],
                        opacity: [0, 1, 1, 0],
                        rotate: [0, c.spin * 0.4, c.spin],
                      }
                }
                transition={{
                  duration: reduceMotion ? 0.35 : 0.95,
                  delay: c.delay,
                  ease: [0.2, 0.75, 0.15, 1],
                  times: reduceMotion ? undefined : [0, 0.35, 1],
                }}
              >
                <CoinGlyph className="size-full drop-shadow-[0_4px_10px_rgba(234,179,8,0.55)]" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default function PrizeCoins() {
  return (
    <div
      dir="rtl"
      lang="fa"
      className="flex h-full w-full items-center justify-center px-4 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <PrizeCoinsForm />
    </div>
  );
}
