"use client";

import { motion, useReducedMotion } from "motion/react";

const ease = [0.16, 1, 0.3, 1] as const;

function OrbitRing({
  delay,
  size,
  duration,
  reduce,
}: {
  delay: number;
  size: number;
  duration: number;
  reduce: boolean;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ width: size, height: size }}
    >
      <motion.div
        className="relative size-full rounded-full border border-[#d4a574]/18"
        initial={reduce ? false : { opacity: 0, scale: 0.86 }}
        animate={
          reduce
            ? { opacity: 0.35, scale: 1 }
            : {
                opacity: [0.15, 0.4, 0.15],
                scale: [1, 1.04, 1],
                rotate: 360,
              }
        }
        transition={
          reduce
            ? { duration: 0 }
            : {
                opacity: {
                  duration: duration * 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay,
                },
                scale: {
                  duration: duration * 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay,
                },
                rotate: { duration, repeat: Infinity, ease: "linear", delay },
              }
        }
      >
        <span className="absolute left-1/2 top-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d4a574] shadow-[0_0_14px_rgba(212,165,116,0.8)]" />
      </motion.div>
    </div>
  );
}

export default function ComingSoon() {
  const reduce = useReducedMotion() ?? false;

  return (
    <main
      dir="rtl"
      lang="fa"
      className="relative flex min-h-dvh flex-col overflow-hidden bg-[#09080c] font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal text-white antialiased"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_35%,rgba(212,165,116,0.18)_0%,transparent_58%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(50%_40%_at_80%_90%,rgba(90,110,140,0.1)_0%,transparent_55%)]" />
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 text-center">
        <div className="relative mb-10 flex size-[220px] items-center justify-center sm:mb-12 sm:size-[260px]">
          <OrbitRing size={220} delay={0} duration={22} reduce={reduce} />
          <OrbitRing size={160} delay={0.4} duration={16} reduce={reduce} />
          <OrbitRing size={100} delay={0.8} duration={11} reduce={reduce} />

          <motion.div
            className="relative flex size-20 items-center justify-center rounded-[22px] bg-[#141218] ring-1 ring-white/12 sm:size-24 sm:rounded-[26px]"
            initial={reduce ? false : { opacity: 0, scale: 0.8 }}
            animate={
              reduce
                ? { opacity: 1, scale: 1 }
                : {
                    opacity: 1,
                    scale: 1,
                    boxShadow: [
                      "0 0 0 0 rgba(212,165,116,0.0)",
                      "0 0 48px 2px rgba(212,165,116,0.28)",
                      "0 0 0 0 rgba(212,165,116,0.0)",
                    ],
                  }
            }
            transition={
              reduce
                ? { duration: 0 }
                : {
                    opacity: { duration: 0.6, ease },
                    scale: { type: "spring", stiffness: 260, damping: 22 },
                    boxShadow: {
                      duration: 3.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.6,
                    },
                  }
            }
          >
            {/* oxlint-disable-next-line next/no-img-element */}
            <img
              src="/tarhak/favicon.png"
              alt=""
              width={48}
              height={48}
              className="size-10 rounded-[10px] sm:size-12 sm:rounded-[12px]"
              aria-hidden
            />
          </motion.div>
        </div>

        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 16, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={
            reduce ? { duration: 0 } : { duration: 0.75, ease, delay: 0.15 }
          }
          className="text-[clamp(2.8rem,14vw,5.5rem)] font-black leading-[0.95] text-white"
        >
          به‌زودی
        </motion.h1>

        <motion.div
          aria-hidden
          initial={reduce ? false : { opacity: 0, scaleX: 0.4 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={
            reduce ? { duration: 0 } : { duration: 0.7, ease, delay: 0.35 }
          }
          className="relative mt-8 h-[2px] w-40 overflow-hidden rounded-full bg-white/10 sm:w-52"
        >
          <motion.span
            className="absolute inset-y-0 w-1/2 bg-linear-to-l from-transparent via-[#d4a574] to-transparent"
            animate={reduce ? { left: "25%" } : { left: ["-50%", "100%"] }}
            transition={
              reduce
                ? { duration: 0 }
                : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
            }
          />
        </motion.div>
      </div>
    </main>
  );
}
