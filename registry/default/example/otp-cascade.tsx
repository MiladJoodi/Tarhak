"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";

const LENGTH = 6;
const DEMO_CODE = "123456";
const SHAKE_MS = 650;
const ERROR_HOLD_MS = 900;
const SUCCESS_HOLD_MS = 2800;

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

function toFaDigits(value: string | number) {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)] ?? d);
}

/** Accept Latin + Persian + Arabic-Indic digits → ASCII 0-9. */
function onlyDigits(value: string) {
  let out = "";
  for (const ch of value) {
    if (ch >= "0" && ch <= "9") {
      out += ch;
    } else {
      const fa = FA_DIGITS.indexOf(ch);
      if (fa >= 0) {
        out += String(fa);
        continue;
      }
      const ar = AR_DIGITS.indexOf(ch);
      if (ar >= 0) out += String(ar);
    }
    if (out.length >= LENGTH) break;
  }
  return out;
}

type Status = "idle" | "error" | "success";

const CELL_BG = "linear-gradient(180deg, #3a3a40 0%, #1c1c1f 100%)";
const CELL_SHADOW =
  "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.07)";

const CELL_TONE = {
  idle: {
    background: CELL_BG,
    boxShadow: CELL_SHADOW,
    digit: "#ffffff",
  },
  success: {
    background: "linear-gradient(165deg, #14532d 0%, #052e16 100%)",
    boxShadow:
      "0 0 0 2px rgba(74,222,128,0.7), 0 0 16px rgba(34,197,94,0.28)",
    digit: "#bbf7d0",
  },
  error: {
    background: "linear-gradient(165deg, #7f1d1d 0%, #450a0a 100%)",
    boxShadow:
      "0 0 0 2px rgba(248,113,113,0.7), 0 0 16px rgba(239,68,68,0.28)",
    digit: "#fecaca",
  },
} as const;

function OtpCell({
  digit,
  index,
  isActive,
  status,
  popping,
  reduceMotion,
  inputRef,
  onFocus,
  onChange,
  onKeyDown,
  onPaste,
}: {
  digit: string;
  index: number;
  isActive: boolean;
  status: Status;
  popping: boolean;
  reduceMotion: boolean;
  inputRef: (el: HTMLInputElement | null) => void;
  onFocus: () => void;
  onChange: (raw: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: ClipboardEvent<HTMLInputElement>) => void;
}) {
  const filled = digit !== "";
  const tone =
    status === "success" || status === "error"
      ? CELL_TONE[status]
      : CELL_TONE.idle;

  return (
    <motion.label
      className="relative block size-[56px] md:size-[64px]"
      animate={
        popping && !reduceMotion
          ? { scale: [1, 1.05, 1], y: [0, -3, 0] }
          : { scale: 1, y: 0 }
      }
      transition={
        reduceMotion
          ? { duration: 0.01 }
          : { duration: 0.35, ease: "easeOut" }
      }
    >
      <span className="sr-only">رقم {toFaDigits(index + 1)}</span>

      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[16px] md:rounded-[18px]"
        style={{
          background: tone.background,
          boxShadow: tone.boxShadow,
          transition:
            "background 0.45s ease, box-shadow 0.45s ease",
        }}
      />

      {isActive && status === "idle" ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute -inset-[3px] rounded-[18px] md:rounded-[20px]"
          style={{ border: "2px solid rgb(251 191 36)" }}
          animate={
            reduceMotion
              ? { opacity: 1 }
              : {
                  opacity: [0.55, 1, 0.55],
                  boxShadow: [
                    "0 0 0 0 rgba(251,191,36,0)",
                    "0 0 0 6px rgba(251,191,36,0.2)",
                    "0 0 0 0 rgba(251,191,36,0)",
                  ],
                }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 1.35, repeat: Infinity, ease: "easeInOut" }
          }
        />
      ) : null}

      {!filled && isActive ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-[28px] w-[2.5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400"
          animate={reduceMotion ? { opacity: 1 } : { opacity: [1, 0.15, 1] }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        />
      ) : null}

      {filled ? (
        <span
          aria-hidden
          dir="ltr"
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-[28px] font-bold leading-none md:text-[32px]"
          style={{
            color: tone.digit,
            transition: "color 0.45s ease",
          }}
        >
          {toFaDigits(digit)}
        </span>
      ) : null}

      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete={index === 0 ? "one-time-code" : "off"}
        name={index === 0 ? "otp" : undefined}
        maxLength={1}
        value={digit}
        disabled={status === "success"}
        aria-invalid={status === "error"}
        onFocus={onFocus}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        className="absolute inset-0 z-20 size-full cursor-text opacity-0"
      />
    </motion.label>
  );
}

/** Same layout for success & error — only color / icon / copy differ. */
function StatusBadge({
  kind,
  reduceMotion,
}: {
  kind: "success" | "error";
  reduceMotion: boolean;
}) {
  const ok = kind === "success";

  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div
        className="flex size-16 items-center justify-center rounded-full"
        style={{
          background: ok ? "#22c55e" : "#ef4444",
          boxShadow: ok
            ? "0 0 0 5px rgba(34,197,94,0.18)"
            : "0 0 0 5px rgba(239,68,68,0.18)",
        }}
        aria-hidden
      >
        <svg viewBox="0 0 48 48" className="size-9 text-white" fill="none">
          {ok ? (
            <path
              d="M12 24.5 L20.5 33 L36 15"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M16 16 L32 32 M32 16 L16 32"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
            />
          )}
        </svg>
      </div>
      <p
        className={`text-[18px] font-bold ${
          ok ? "text-emerald-300" : "text-red-300"
        }`}
      >
        {ok ? "تأیید شد" : "کد نادرست است"}
      </p>
    </motion.div>
  );
}

export function OtpCascadeForm() {
  const reduceMotion = useReducedMotion() ?? false;
  const [digits, setDigits] = useState<string[]>(() => Array(LENGTH).fill(""));
  const [status, setStatus] = useState<Status>("idle");
  const [active, setActive] = useState(0);
  const [popIndex, setPopIndex] = useState<number | null>(null);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  const focusAt = useCallback((index: number) => {
    const i = Math.max(0, Math.min(LENGTH - 1, index));
    setActive(i);
    inputsRef.current[i]?.focus();
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    setDigits(Array(LENGTH).fill(""));
    setStatus("idle");
    setPopIndex(null);
    focusAt(0);
  }, [clearTimers, focusAt]);

  const validate = useCallback(
    (next: string[]) => {
      const code = next.join("");
      if (code.length < LENGTH) return;

      if (code === DEMO_CODE) {
        setStatus("success");
        schedule(() => reset(), SUCCESS_HOLD_MS);
        return;
      }

      setStatus("error");
      schedule(() => {
        setDigits(Array(LENGTH).fill(""));
        setStatus("idle");
        setPopIndex(null);
        focusAt(0);
      }, reduceMotion ? 280 : ERROR_HOLD_MS + SHAKE_MS * 0.35);
    },
    [focusAt, reduceMotion, schedule]
  );

  const commit = useCallback(
    (index: number, char: string) => {
      if (status === "success") return;

      const digit = onlyDigits(char).slice(-1);
      if (!digit) return;

      setStatus("idle");
      setPopIndex(index);
      schedule(() => setPopIndex(null), reduceMotion ? 80 : 320);

      let filled: string[] = [];
      setDigits((prev) => {
        filled = [...prev];
        filled[index] = digit;
        return filled;
      });

      if (index < LENGTH - 1) {
        focusAt(index + 1);
      } else {
        schedule(() => validate(filled), 50);
      }
    },
    [focusAt, reduceMotion, schedule, status, validate]
  );

  const onChange = useCallback(
    (index: number, raw: string) => {
      if (raw.length > 1) {
        const all = onlyDigits(raw);
        if (all.length > 1) {
          const next = Array(LENGTH)
            .fill("")
            .map((_, i) => all[i] ?? "");
          setDigits(next);
          setStatus("idle");
          const last = Math.min(all.length, LENGTH) - 1;
          setPopIndex(last);
          schedule(() => setPopIndex(null), reduceMotion ? 80 : 320);
          if (all.length >= LENGTH) {
            schedule(() => validate(next), 50);
          } else {
            focusAt(all.length);
          }
          return;
        }
      }
      commit(index, raw);
    },
    [commit, focusAt, reduceMotion, schedule, validate]
  );

  const onKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      // Digits via keydown — reliable for FA/EN keyboards
      const fromKey = onlyDigits(e.key);
      if (fromKey.length === 1 && e.key.length === 1) {
        e.preventDefault();
        commit(index, fromKey);
        return;
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        setStatus("idle");
        setDigits((prev) => {
          const next = [...prev];
          if (next[index]) {
            next[index] = "";
            return next;
          }
          if (index > 0) {
            next[index - 1] = "";
            focusAt(index - 1);
          }
          return next;
        });
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        focusAt(index - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        focusAt(index + 1);
      }
    },
    [commit, focusAt]
  );

  const onPaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const all = onlyDigits(e.clipboardData.getData("text"));
      if (!all) return;
      const next = Array(LENGTH)
        .fill("")
        .map((_, i) => all[i] ?? "");
      setDigits(next);
      setStatus("idle");
      const filledCount = Math.min(all.length, LENGTH);
      setPopIndex(filledCount - 1);
      schedule(() => setPopIndex(null), reduceMotion ? 80 : 360);
      if (filledCount >= LENGTH) {
        schedule(() => validate(next), 50);
      } else {
        focusAt(filledCount);
      }
    },
    [focusAt, reduceMotion, schedule, validate]
  );

  const shakeX =
    status === "error" && !reduceMotion
      ? [0, -7, 6, -4, 2, 0]
      : 0;

  return (
    <section
      aria-label="ورود کد تأیید"
      className="relative flex w-full max-w-[460px] flex-col items-center md:max-w-[520px]"
      dir="rtl"
      lang="fa"
    >
      <div
        className="relative w-full overflow-hidden rounded-[32px] px-5 py-8 md:px-8 md:py-10"
        style={{
          background:
            "linear-gradient(165deg, #27272a 0%, #18181b 45%, #09090b 100%)",
          boxShadow:
            "0 32px 56px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        <div className="relative mb-7 text-center md:mb-8">
          <p
            className={`text-[12px] font-medium transition-colors duration-300 ${
              status === "error"
                ? "text-red-400"
                : status === "success"
                  ? "text-emerald-400"
                  : "text-zinc-400"
            }`}
          >
            تأیید هویت
          </p>
          <h2 className="mt-1 text-[22px] font-bold text-white md:text-[26px]">
            {status === "success"
              ? "کد درست بود"
              : status === "error"
                ? "کد اشتباه است"
                : "کد ۶ رقمی را وارد کنید"}
          </h2>
          <p className="mt-2 text-[13px] text-zinc-500">
            {status === "success"
              ? "هویت شما تأیید شد"
              : status === "error"
                ? "دوباره تلاش کنید"
                : "کد به شمارهٔ شما پیامک شد"}
          </p>
        </div>

        <motion.div
          dir="ltr"
          className="flex justify-center gap-2.5 md:gap-3"
          animate={{ x: shakeX }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
          role="group"
          aria-label="کد تأیید شش رقمی"
        >
          {digits.map((digit, index) => (
            <OtpCell
              key={index}
              digit={digit}
              index={index}
              isActive={active === index && status === "idle"}
              status={status}
              popping={popIndex === index}
              reduceMotion={reduceMotion}
              inputRef={(el) => {
                inputsRef.current[index] = el;
              }}
              onFocus={() => setActive(index)}
              onChange={(raw) => onChange(index, raw)}
              onKeyDown={(e) => onKeyDown(index, e)}
              onPaste={onPaste}
            />
          ))}
        </motion.div>

        <div
          className="relative mt-6 flex min-h-[100px] items-center justify-center"
          aria-live="polite"
        >
          {status === "success" || status === "error" ? (
            <StatusBadge kind={status} reduceMotion={reduceMotion} />
          ) : (
            <p className="text-[13px] text-zinc-400">
              کد دمو:{" "}
              <span dir="ltr" className="font-bold text-amber-300">
                {toFaDigits(DEMO_CODE)}
              </span>
            </p>
          )}
        </div>

        {status !== "success" ? (
          <div className="relative mt-4 flex items-center justify-center">
            <button
              type="button"
              onClick={reset}
              className="text-[13px] font-medium text-zinc-400 underline-offset-4 transition-colors hover:text-zinc-200 hover:underline"
            >
              پاک کردن
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default function OtpCascade() {
  return (
    <div
      dir="rtl"
      lang="fa"
      className="flex h-full w-full items-center justify-center px-4 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <OtpCascadeForm />
    </div>
  );
}
