"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  MotionConfig,
  useReducedMotion,
} from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  SourceCodeIcon,
} from "@hugeicons/core-free-icons";
import clsx from "clsx";

// Change Here — کدی که تایپ می‌شود
const SAMPLE_CODE = `export function Hello() {
  return (
    <h1 className="text-xl">
      سلام طرحَک
    </h1>
  );
}`;

const ROW_EASE: [number, number, number, number] = [0.215, 0.61, 0.355, 1];

/** Pause weight per character — soft, human cadence. */
function charDelay(ch: string, reduce: boolean): number {
  if (reduce) return 0;
  if (ch === "\n") return 140;
  if (ch === " ") return 28;
  if (/[.{};()<>/=]/.test(ch)) return 52;
  if (/[آ-ی]/.test(ch)) return 38;
  return 22;
}

/** VS Code Dark+ (default dark) token colors */
const VS = {
  bg: "#1E1E1E",
  fg: "#D4D4D4",
  line: "#858585",
  comment: "#6A9955",
  string: "#CE9178",
  keyword: "#569CD6",
  control: "#C586C0",
  tag: "#569CD6",
  attr: "#9CDCFE",
  fn: "#DCDCAA",
  number: "#B5CEA8",
  cursor: "#AEAFAD",
} as const;

type TokenKind =
  | "plain"
  | "kw"
  | "control"
  | "str"
  | "tag"
  | "attr"
  | "fn"
  | "num"
  | "cmt";

function highlightLine(line: string) {
  const parts: { text: string; kind: TokenKind }[] = [];
  const re =
    /(\/\/.*$)|("(?:\\.|[^"])*"|'(?:\\.|[^'])*'|`(?:\\.|[^`])*`)|(\b(?:return|if|else|for|while|switch|case|break|continue|await|async|yield|new|typeof|instanceof)\b)|(\b(?:export|function|const|let|var|import|from|default|class|type|interface|extends|implements)\b)|(\b\d+\.?\d*\b)|(<\/?[A-Za-z][\w.]*)|(\b[A-Za-z_][\w]*(?=\s*=))|(\b[A-Za-z_][\w]*(?=\s*\())|([^"'/`<\d]+)/gm;
  let m: RegExpExecArray | null;
  let last = 0;
  while ((m = re.exec(line))) {
    if (m.index > last) {
      parts.push({ text: line.slice(last, m.index), kind: "plain" });
    }
    if (m[1]) parts.push({ text: m[1], kind: "cmt" });
    else if (m[2]) parts.push({ text: m[2], kind: "str" });
    else if (m[3]) parts.push({ text: m[3], kind: "control" });
    else if (m[4]) parts.push({ text: m[4], kind: "kw" });
    else if (m[5]) parts.push({ text: m[5], kind: "num" });
    else if (m[6]) parts.push({ text: m[6], kind: "tag" });
    else if (m[7]) parts.push({ text: m[7], kind: "attr" });
    else if (m[8]) parts.push({ text: m[8], kind: "fn" });
    else if (m[9]) parts.push({ text: m[9], kind: "plain" });
    last = m.index + m[0].length;
  }
  if (last < line.length) parts.push({ text: line.slice(last), kind: "plain" });
  if (parts.length === 0) parts.push({ text: line, kind: "plain" });
  return parts;
}

const kindColor: Record<TokenKind, string> = {
  plain: VS.fg,
  kw: VS.keyword,
  control: VS.control,
  str: VS.string,
  tag: VS.tag,
  attr: VS.attr,
  fn: VS.fn,
  num: VS.number,
  cmt: VS.comment,
};

export default function TypedCode() {
  const reduce = useReducedMotion() ?? false;
  const layoutGroup = useId().replace(/:/g, "");
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef(0);
  const preRef = useRef<HTMLPreElement>(null);

  const stopTyping = useCallback(() => {
    window.clearTimeout(timerRef.current);
  }, []);

  const startTyping = useCallback(() => {
    stopTyping();
    indexRef.current = 0;
    setTyped("");
    setDone(false);

    const tick = () => {
      const i = indexRef.current;
      if (i >= SAMPLE_CODE.length) {
        setDone(true);
        return;
      }
      const ch = SAMPLE_CODE[i]!;
      indexRef.current = i + 1;
      setTyped(SAMPLE_CODE.slice(0, i + 1));
      timerRef.current = window.setTimeout(
        tick,
        charDelay(ch, reduce),
      );
    };

    timerRef.current = window.setTimeout(tick, reduce ? 40 : 320);
  }, [reduce, stopTyping]);

  useEffect(() => {
    if (open) startTyping();
    else {
      stopTyping();
      setTyped("");
      setDone(false);
    }
    return stopTyping;
  }, [open, startTyping, stopTyping]);

  useEffect(() => {
    const el = preRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [typed]);

  const lines = typed.split("\n");
  // Keep trailing empty line visible while typing after \n
  const displayLines =
    typed.endsWith("\n") && !done ? [...lines] : lines;

  return (
    <LayoutGroup id={layoutGroup}>
      <section
        dir="rtl"
        lang="fa"
        aria-label="نمایش کد با تایپ"
        className="relative flex min-h-[320px] w-full max-w-[420px] items-center justify-center font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
      >
        <MotionConfig
          transition={{ type: "spring", duration: 0.85, bounce: 0.32 }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {!open ? (
              <motion.button
                key="trigger"
                type="button"
                layoutId={`${layoutGroup}-shell`}
                onClick={() => setOpen(true)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, filter: "blur(8px)" }}
                whileTap={reduce ? undefined : { scale: 0.97 }}
                className={clsx(
                  "inline-flex cursor-pointer items-center gap-x-3 border border-border bg-card px-5 py-3.5 text-foreground outline-none",
                  "hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                )}
                style={{ borderRadius: 20, borderWidth: 1 }}
              >
                <motion.span
                  layoutId={`${layoutGroup}-icon`}
                  className="flex size-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground"
                >
                  <HugeiconsIcon icon={SourceCodeIcon} size={22} />
                </motion.span>
                <span className="text-xl font-semibold">نمایش کد</span>
              </motion.button>
            ) : (
              <motion.div
                key="panel"
                layoutId={`${layoutGroup}-shell`}
                role="dialog"
                aria-label="پیش‌نمایش کد"
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.94, filter: "blur(10px)" }}
                className="relative flex w-full flex-col overflow-hidden border border-[#3C3C3C] shadow-[0_24px_64px_-28px_rgba(0,0,0,0.65)]"
                style={{
                  borderRadius: 20,
                  borderWidth: 1,
                  minHeight: 280,
                  backgroundColor: VS.bg,
                  color: VS.fg,
                }}
              >
                {/* Title bar — VS Code chrome */}
                <div className="flex items-center gap-3 border-b border-[#3C3C3C] px-4 py-3">
                  <motion.span
                    layoutId={`${layoutGroup}-icon`}
                    className="flex size-9 items-center justify-center rounded-full border border-[#3C3C3C] bg-[#2D2D2D]"
                    style={{ color: VS.fg }}
                  >
                    <HugeiconsIcon icon={SourceCodeIcon} size={18} />
                  </motion.span>
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-base font-medium"
                      style={{ color: VS.fg }}
                    >
                      Hello.tsx
                    </p>
                    <p className="text-sm" style={{ color: VS.line }}>
                      {done ? "آماده" : "در حال نوشتن…"}
                    </p>
                  </div>
                  <motion.button
                    type="button"
                    aria-label="بستن"
                    onClick={() => setOpen(false)}
                    whileTap={reduce ? undefined : { scale: 0.9 }}
                    className="inline-flex size-9 cursor-pointer items-center justify-center rounded-xl hover:bg-[#2A2D2E]"
                    style={{ color: VS.line }}
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={18} />
                  </motion.button>
                </div>

                {/* Code surface */}
                <pre
                  ref={preRef}
                  dir="ltr"
                  lang="en"
                  className="m-0 max-h-[280px] flex-1 overflow-auto px-4 py-4 font-mono text-[13.5px] leading-7 tracking-normal [scrollbar-width:thin]"
                  style={{ color: VS.fg, backgroundColor: VS.bg }}
                >
                  <code className="block whitespace-pre">
                    {displayLines.map((line, lineIndex) => {
                      const isLast = lineIndex === displayLines.length - 1;
                      const tokens = highlightLine(line);
                      return (
                        <span key={lineIndex} className="block">
                          <span
                            className="inline-block w-7 select-none"
                            style={{ color: VS.line }}
                          >
                            {lineIndex + 1}
                          </span>
                          {tokens.map((tok, ti) => (
                            <span
                              key={ti}
                              style={{ color: kindColor[tok.kind] }}
                            >
                              {tok.text}
                            </span>
                          ))}
                          {isLast && !done ? (
                            <motion.span
                              aria-hidden
                              className="ms-0.5 inline-block h-[1.05em] w-[2px] translate-y-[2px] rounded-sm align-middle"
                              style={{ backgroundColor: VS.cursor }}
                              animate={
                                reduce
                                  ? { opacity: 1 }
                                  : { opacity: [1, 0.15, 1] }
                              }
                              transition={
                                reduce
                                  ? { duration: 0 }
                                  : {
                                      duration: 0.95,
                                      repeat: Infinity,
                                      ease: "easeInOut",
                                    }
                              }
                            />
                          ) : null}
                          {"\n"}
                        </span>
                      );
                    })}
                  </code>
                </pre>

                {/* Soft bottom veil */}
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#1E1E1E] to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: done ? 0 : 0.85 }}
                  transition={{ duration: 0.4, ease: ROW_EASE }}
                />

                {done ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      bounce: 0.25,
                      duration: 0.5,
                      delay: 0.08,
                    }}
                    className="flex gap-2 border-t border-[#3C3C3C] px-4 py-3"
                  >
                    <button
                      type="button"
                      onClick={() => startTyping()}
                      className="flex-1 cursor-pointer rounded-2xl border border-[#3C3C3C] bg-[#2D2D2D] px-3 py-2.5 text-sm hover:bg-[#37373D]"
                      style={{ color: VS.fg }}
                    >
                      دوباره بنویس
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="flex-1 cursor-pointer rounded-2xl border border-[#3C3C3C] bg-[#2D2D2D] px-3 py-2.5 text-sm hover:bg-[#37373D]"
                      style={{ color: VS.fg }}
                    >
                      بستن
                    </button>
                  </motion.div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </MotionConfig>
      </section>
    </LayoutGroup>
  );
}
