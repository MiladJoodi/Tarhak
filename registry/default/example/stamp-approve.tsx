"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

export type StampStatus = "idle" | "windup" | "stamping" | "stamped";

/** Shared geometry — face and imprint share this box. */
const FACE = 76;
const SCENE_H = 318;
const PAPER_H = 210;
/** Contact center inside the paper (from paper top). */
const CONTACT_TOP = 118;
/** How far the stamp rises above the contact pose when idle. */
const IDLE_LIFT = 92;
const WINDUP_EXTRA = 22;

const WINDUP_MS = 260;
const STAMP_DOWN_MS = 220;
const STAMP_HOLD_MS = 260;
const STAMP_UP_MS = 480;
const RESET_DELAY_MS = 3000;
const REDUCED_STAMP_MS = 160;
const REDUCED_RESET_MS = 900;

const LABELS: Record<StampStatus, string> = {
  idle: "مهر تأیید",
  windup: "آماده‌سازی…",
  stamping: "مهر زدن…",
  stamped: "تأیید شد",
};

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_SLAM = [0.75, 0.05, 0.95, 0.4] as const;

type Particle = {
  id: number;
  angle: number;
  dist: number;
  size: number;
  delay: number;
};

function randomTilt() {
  return -7 + Math.random() * 14;
}

function makeParticles(seed: number): Particle[] {
  return Array.from({ length: 8 }, (_, i) => ({
    id: i,
    angle: (Math.PI * 2 * i) / 8 + (seed % 5) * 0.08,
    dist: 28 + ((seed + i * 9) % 18),
    size: 1.5 + ((seed + i) % 3),
    delay: i * 0.01,
  }));
}

/** Same seal drawing for rubber face + paper imprint. */
function SealMark({
  mode,
  uid,
}: {
  mode: "rubber" | "ink";
  uid: string;
}) {
  const ink = mode === "ink";
  const stroke = ink ? "#9f1239" : "rgba(255,228,230,0.55)";
  const fill = ink ? "#9f1239" : "rgba(255,241,242,0.92)";

  return (
    <svg className="size-full" viewBox="0 0 100 100" fill="none" aria-hidden>
      {ink ? (
        <defs>
          <filter id={`${uid}-ink`} x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="1.1"
              numOctaves="2"
              result="n"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="n"
              scale="1.1"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      ) : null}
      <g filter={ink ? `url(#${uid}-ink)` : undefined} opacity={ink ? 0.9 : 1}>
        <circle cx="50" cy="50" r="42" stroke={stroke} strokeWidth={ink ? 2.8 : 2.2} />
        <circle
          cx="50"
          cy="50"
          r="35"
          stroke={stroke}
          strokeWidth={1}
          strokeDasharray="2 2.4"
          opacity={0.7}
        />
        <circle cx="50" cy="50" r="28" stroke={stroke} strokeWidth={1.4} opacity={0.85} />
      </g>
      <text
        x="50"
        y="53"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={fill}
        fontSize="13"
        fontWeight="700"
        style={{ fontFamily: "var(--font-estedad), Tahoma, Arial, sans-serif" }}
      >
        تأیید شد
      </text>
    </svg>
  );
}

function DocumentBody() {
  return (
    <div aria-hidden className="flex flex-col gap-1.5 pt-0.5">
      <div className="h-1.5 w-[70%] rounded-full bg-stone-400/50" />
      <div className="h-1.5 w-full rounded-full bg-stone-300/75" />
      <div className="h-1.5 w-[93%] rounded-full bg-stone-300/65" />
      <div className="h-1.5 w-[86%] rounded-full bg-stone-300/65" />
      <div className="mt-2 h-1.5 w-[55%] rounded-full bg-stone-300/55" />
      <div className="h-1.5 w-[78%] rounded-full bg-stone-300/55" />
      <div className="mt-3 h-px w-16 bg-stone-400/35" />
    </div>
  );
}

function InkImprint({ rotate, uid }: { rotate: number; uid: string }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10 p-1.5"
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 0.88, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      style={{ rotate }}
      transition={{ type: "spring", stiffness: 520, damping: 28, mass: 0.55 }}
    >
      <SealMark mode="ink" uid={`${uid}-imprint`} />
    </motion.div>
  );
}

function InkBurst({ particles }: { particles: Particle[] }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-20">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-1/2 left-1/2 rounded-full bg-rose-800/65"
          style={{
            width: p.size,
            height: p.size,
            marginLeft: -p.size / 2,
            marginTop: -p.size / 2,
          }}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
          animate={{
            opacity: [0, 0.85, 0],
            x: Math.cos(p.angle) * p.dist,
            y: Math.sin(p.angle) * p.dist,
            scale: [0.5, 1, 0.2],
          }}
          transition={{ duration: 0.42, delay: p.delay, ease: EASE_OUT }}
        />
      ))}
    </div>
  );
}

function StampTool({
  status,
  reduceMotion,
  hovering,
  tilt,
  uid,
}: {
  status: StampStatus;
  reduceMotion: boolean;
  hovering: boolean;
  tilt: number;
  uid: string;
}) {
  // Contact pose = y: 0 (face sits exactly on the contact box).
  // Positive y moves down — we only lift with negative y.
  let y = -IDLE_LIFT;
  let rotate = -3;
  let scale = 1;

  if (status === "windup") {
    y = -(IDLE_LIFT + WINDUP_EXTRA);
    rotate = -8;
    scale = 1.02;
  } else if (status === "stamping") {
    y = 0;
    rotate = tilt;
    scale = 0.985;
  } else if (status === "stamped") {
    y = -IDLE_LIFT + 8;
    rotate = tilt * 0.35;
    scale = 1;
  } else if (hovering && !reduceMotion) {
    y = -(IDLE_LIFT + 8);
    rotate = -5;
  }

  const shadowOpacity =
    status === "stamping" ? 0.22 : status === "windup" ? 0.08 : 0.12;
  const shadowScale = status === "stamping" ? 1 : status === "windup" ? 0.75 : 0.88;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-30"
      style={{
        // Anchor the stamp so its FACE fills the contact box when y=0.
        left: "50%",
        top: CONTACT_TOP,
        width: FACE,
        height: FACE,
        marginLeft: -FACE / 2,
      }}
    >
      {/* shadow under face, locked to contact */}
      <motion.div
        className="absolute top-1/2 left-1/2 h-3 w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-stone-900 blur-[2.5px]"
        animate={{ opacity: shadowOpacity, scale: shadowScale }}
        transition={{ duration: reduceMotion ? 0.1 : STAMP_DOWN_MS / 1000 }}
      />

      <motion.div
        className="absolute inset-0 flex flex-col items-center"
        style={{ transformOrigin: "50% 50%" }}
        animate={{ y, rotate, scale }}
        transition={
          reduceMotion
            ? { duration: 0.12 }
            : status === "stamping"
              ? { duration: STAMP_DOWN_MS / 1000, ease: EASE_SLAM }
              : { type: "spring", stiffness: 280, damping: 20, mass: 0.85 }
        }
      >
        {/* handle stack sits above the face; face is the bottom FACE×FACE */}
        <div className="absolute bottom-full mb-0 flex w-full flex-col items-center">
          {/* mushroom wood knob */}
          <div
            className="h-6 w-11 rounded-[50%] shadow-[inset_0_2px_0_rgba(255,255,255,0.2),inset_0_-2px_3px_rgba(0,0,0,0.35),0_2px_6px_rgba(0,0,0,0.2)]"
            style={{
              background:
                "radial-gradient(120% 80% at 35% 30%, #c4a574 0%, #8b5e34 42%, #5c3a1e 100%)",
            }}
          />
          {/* shaft */}
          <div
            className="-mt-0.5 h-9 w-[15px] rounded-b-sm shadow-[inset_2px_0_0_rgba(255,255,255,0.12),inset_-2px_0_0_rgba(0,0,0,0.3)]"
            style={{
              background:
                "linear-gradient(90deg, #6b4226 0%, #b8956a 40%, #8b5e34 55%, #4a2c16 100%)",
            }}
          />
          {/* metal collar */}
          <div className="-mt-px h-2.5 w-8 rounded-[2px] bg-gradient-to-b from-zinc-300 via-zinc-400 to-zinc-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]" />
        </div>

        {/* rubber face — same size as imprint */}
        <div
          className="relative size-full overflow-hidden rounded-full shadow-[0_3px_0_#4c0519,0_8px_14px_rgba(0,0,0,0.22)]"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, #fb7185 0%, #be123c 45%, #881337 100%)",
          }}
        >
          <div className="absolute inset-[5px] rounded-full border border-rose-200/20" />
          <div className="p-1.5">
            <SealMark mode="rubber" uid={`${uid}-face`} />
          </div>
          <div className="pointer-events-none absolute inset-x-3 top-2 h-2.5 rounded-full bg-white/15 blur-[1px]" />
        </div>
      </motion.div>
    </div>
  );
}

export function StampApproveButton() {
  const uid = useId().replace(/:/g, "");
  const [status, setStatus] = useState<StampStatus>("idle");
  const [tilt, setTilt] = useState(-4);
  const [showImprint, setShowImprint] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [hovering, setHovering] = useState(false);
  const timersRef = useRef<number[]>([]);
  const reduceMotion = useReducedMotion() ?? false;

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  const handleStamp = useCallback(() => {
    if (status !== "idle") return;

    const nextTilt = randomTilt();
    const seed = Date.now();
    setTilt(nextTilt);
    setShowImprint(false);
    setParticles([]);
    clearTimers();

    if (reduceMotion) {
      setStatus("stamping");
      schedule(() => {
        setShowImprint(true);
        setStatus("stamped");
        schedule(() => {
          setShowImprint(false);
          setStatus("idle");
        }, REDUCED_RESET_MS);
      }, REDUCED_STAMP_MS);
      return;
    }

    setStatus("windup");
    schedule(() => setStatus("stamping"), WINDUP_MS);

    const impactAt = WINDUP_MS + STAMP_DOWN_MS;

    schedule(() => {
      setShowImprint(true);
      setParticles(makeParticles(seed));
      setBurstKey((k) => k + 1);
    }, impactAt);

    schedule(() => setStatus("stamped"), impactAt + STAMP_HOLD_MS);

    schedule(() => {
      setShowImprint(false);
      setParticles([]);
      setStatus("idle");
    }, impactAt + STAMP_HOLD_MS + STAMP_UP_MS + RESET_DELAY_MS);
  }, [clearTimers, reduceMotion, schedule, status]);

  const paperPress =
    status === "stamping" && !reduceMotion
      ? { scaleY: 0.988, y: 1.5 }
      : { scaleY: 1, y: 0 };

  return (
    <section
      aria-label="مهر تأیید سند"
      className="relative flex h-[390px] w-full max-w-[340px] flex-col items-center justify-end"
      dir="rtl"
      lang="fa"
    >
      <div className="relative w-[260px]" style={{ height: SCENE_H }}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[-12px] bottom-[-4px] h-8 rounded-[100%] bg-stone-900/10 blur-md"
        />

        <motion.div
          animate={paperPress}
          className="absolute inset-x-0 bottom-0 overflow-hidden rounded-md border border-stone-300/90 bg-[#f3ebe1] shadow-[0_16px_36px_rgba(28,25,23,0.14),inset_0_1px_0_rgba(255,255,255,0.65)]"
          style={{ height: PAPER_H, transformOrigin: "50% 100%" }}
          transition={
            status === "stamping"
              ? { duration: 0.1, ease: EASE_SLAM }
              : { type: "spring", stiffness: 340, damping: 24 }
          }
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-multiply"
            style={{
              backgroundImage:
                "radial-gradient(circle at 25% 30%, #78716c 0.5px, transparent 0.6px)",
              backgroundSize: "7px 7px",
            }}
          />

          <div className="relative px-5 pt-5">
            <div className="mb-2 flex items-center justify-between">
              <div className="h-2.5 w-16 rounded-full bg-stone-500/40" />
              <div className="size-6 rounded-full border border-stone-300 bg-stone-50" />
            </div>
            <p className="mb-2 text-[11px] font-medium text-stone-500">
              درخواست شماره ۱۴۰۴
            </p>
            <DocumentBody />
          </div>

          {/* Shared contact box: imprint + burst + stamp face align here */}
          <div
            className="absolute left-1/2 z-10"
            style={{
              top: CONTACT_TOP,
              width: FACE,
              height: FACE,
              marginLeft: -FACE / 2,
            }}
          >
            <AnimatePresence>
              {showImprint ? (
                <InkImprint key={`ink-${burstKey}`} rotate={tilt} uid={uid} />
              ) : null}
            </AnimatePresence>
            <AnimatePresence>
              {particles.length > 0 ? (
                <InkBurst key={`burst-${burstKey}`} particles={particles} />
              ) : null}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Stamp lives in scene coords; contact top matches paper's contact */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{ height: PAPER_H }}
        >
          <StampTool
            hovering={hovering}
            reduceMotion={reduceMotion}
            status={status}
            tilt={tilt}
            uid={uid}
          />
        </div>
      </div>

      <button
        aria-label={LABELS[status]}
        className="mt-5 flex cursor-pointer items-center gap-2 rounded-md border border-b-4 border-rose-900 bg-rose-600 px-5 py-1.5 text-sm font-medium text-white outline-none transition-[transform,opacity,background-color] duration-200 ease-out hover:bg-rose-500 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-rose-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100 motion-reduce:active:scale-100"
        disabled={status !== "idle"}
        onClick={handleStamp}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onFocus={() => setHovering(true)}
        onBlur={() => setHovering(false)}
        type="button"
      >
        <svg
          aria-hidden
          className="size-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M9 3h6v3H9V3Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M10.5 6h3v2.2a1 1 0 0 0 1 1H16.5A1.5 1.5 0 0 1 18 10.7V13H6v-2.3A1.5 1.5 0 0 1 7.5 9.2H9.5a1 1 0 0 0 1-1V6Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="17.5" r="2.8" stroke="currentColor" strokeWidth="1.7" />
        </svg>
        {LABELS[status]}
      </button>
    </section>
  );
}

export default function StampApprove() {
  return (
    <div
      dir="rtl"
      lang="fa"
      className="flex h-full w-full items-center justify-center font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <StampApproveButton />
    </div>
  );
}
