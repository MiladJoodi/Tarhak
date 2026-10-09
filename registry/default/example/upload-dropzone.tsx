"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type DragEvent,
  type ChangeEvent,
} from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  MotionConfig,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  File01Icon,
  Image01Icon,
  Tick02Icon,
  Upload04Icon,
} from "@hugeicons/core-free-icons";
import clsx from "clsx";

type Phase = "idle" | "dragging" | "catching" | "uploading" | "done";

type FileMeta = {
  name: string;
  size: number;
  type: string;
  previewUrl: string | null;
};

const FA = "۰۱۲۳۴۵۶۷۸۹";
function toFa(n: number | string) {
  return String(n).replace(/\d/g, (d) => FA[Number(d)] ?? d);
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${toFa(bytes)} بایت`;
  if (bytes < 1024 * 1024) return `${toFa((bytes / 1024).toFixed(1))} کیلوبایت`;
  return `${toFa((bytes / (1024 * 1024)).toFixed(1))} مگابایت`;
}

const ROW_EASE: [number, number, number, number] = [0.215, 0.61, 0.355, 1];
const UPLOAD_MS = 3200;
const SEGMENTS = 12;

function isImage(type: string) {
  return type.startsWith("image/");
}

function OrbitDots({ active }: { active: boolean }) {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          aria-hidden
          className="pointer-events-none absolute size-2 rounded-full bg-primary/55"
          style={{ top: "50%", left: "50%", marginTop: -4, marginLeft: -4 }}
          animate={
            active
              ? {
                  x: [0, 56, 0, -56, 0],
                  y: [-56, 0, 56, 0, -56],
                  opacity: [0.15, 0.9, 0.15],
                  scale: [0.65, 1.2, 0.65],
                }
              : { opacity: 0, scale: 0 }
          }
          transition={{
            duration: 3.8 + i * 0.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        />
      ))}
    </>
  );
}

function Shockwave({ fire }: { fire: boolean }) {
  return (
    <AnimatePresence>
      {fire
        ? [0, 1].map((i) => (
            <motion.span
              key={i}
              aria-hidden
              className="pointer-events-none absolute inset-0 border-2 border-primary"
              style={{ borderRadius: 22 }}
              initial={{ opacity: 0.75, scale: 0.94 }}
              animate={{ opacity: 0, scale: 1.2 + i * 0.1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.75,
                ease: ROW_EASE,
                delay: i * 0.09,
              }}
            />
          ))
        : null}
    </AnimatePresence>
  );
}

export default function UploadDropzone() {
  const reduce = useReducedMotion() ?? false;
  const layoutGroup = useId().replace(/:/g, "");
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const rafRef = useRef(0);
  const catchTimerRef = useRef(0);
  const doneTimerRef = useRef(0);
  const shockTimerRef = useRef(0);

  const [phase, setPhase] = useState<Phase>("idle");
  const [file, setFile] = useState<FileMeta | null>(null);
  const [progress, setProgress] = useState(0);
  const [shock, setShock] = useState(false);
  const [pctLabel, setPctLabel] = useState("۰");

  const progressMv = useMotionValue(0);
  const progressSpring = useSpring(progressMv, {
    stiffness: reduce ? 380 : 36,
    damping: reduce ? 36 : 10,
    mass: reduce ? 0.35 : 1.4,
  });
  const barWidth = useTransform(
    progressSpring,
    (v) => `${Math.min(100, Math.max(0, v))}%`,
  );
  const displayPct = useTransform(progressSpring, (v) =>
    toFa(Math.round(Math.min(100, Math.max(0, v)))),
  );

  const litSegments = Math.round((progress / 100) * SEGMENTS);

  const clearPreviewUrl = useCallback((meta: FileMeta | null) => {
    if (meta?.previewUrl) URL.revokeObjectURL(meta.previewUrl);
  }, []);

  useEffect(() => {
    const unsub = displayPct.on("change", (v) => setPctLabel(v));
    return unsub;
  }, [displayPct]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.clearTimeout(catchTimerRef.current);
      window.clearTimeout(doneTimerRef.current);
      window.clearTimeout(shockTimerRef.current);
    };
  }, []);

  useEffect(() => {
    progressMv.set(progress);
  }, [progress, progressMv]);

  const startUpload = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setPhase("uploading");
    setProgress(0);
    const start = performance.now();
    const duration = reduce ? 900 : UPLOAD_MS;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased =
        t < 0.18
          ? 0.32 * (t / 0.18) ** 2
          : t < 0.7
            ? 0.32 + 0.58 * ((t - 0.18) / 0.52)
            : 0.9 + 0.1 * (1 - Math.pow(1 - (t - 0.7) / 0.3, 3));
      setProgress(Math.min(100, Math.round(eased * 100)));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setProgress(100);
        doneTimerRef.current = window.setTimeout(
          () => setPhase("done"),
          reduce ? 140 : 560,
        );
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [reduce]);

  const acceptFile = useCallback(
    (raw: File) => {
      setFile((prev) => {
        clearPreviewUrl(prev);
        return {
          name: raw.name,
          size: raw.size,
          type: raw.type || "application/octet-stream",
          previewUrl: isImage(raw.type) ? URL.createObjectURL(raw) : null,
        };
      });
      setShock(true);
      setPhase("catching");
      setProgress(0);
      window.clearTimeout(catchTimerRef.current);
      window.clearTimeout(shockTimerRef.current);
      shockTimerRef.current = window.setTimeout(() => setShock(false), 720);
      catchTimerRef.current = window.setTimeout(
        () => startUpload(),
        reduce ? 220 : 980,
      );
    },
    [clearPreviewUrl, reduce, startUpload],
  );

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    window.clearTimeout(catchTimerRef.current);
    window.clearTimeout(doneTimerRef.current);
    window.clearTimeout(shockTimerRef.current);
    setFile((prev) => {
      clearPreviewUrl(prev);
      return null;
    });
    setProgress(0);
    progressMv.set(0);
    setShock(false);
    setPhase("idle");
    if (inputRef.current) inputRef.current.value = "";
  }, [clearPreviewUrl, progressMv]);

  const onDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current += 1;
    if (phase === "idle" || phase === "dragging") setPhase("dragging");
  };

  const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0 && phase === "dragging") setPhase("idle");
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current = 0;
    const next = e.dataTransfer.files?.[0];
    if (next) acceptFile(next);
    else setPhase("idle");
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.files?.[0];
    if (next) acceptFile(next);
  };

  const idleOrDrag = phase === "idle" || phase === "dragging";
  const showCard =
    (phase === "catching" || phase === "uploading" || phase === "done") &&
    !!file;

  return (
    <LayoutGroup id={layoutGroup}>
      <section
        dir="rtl"
        lang="fa"
        aria-label="ناحیه آپلود فایل"
        className="flex w-full max-w-[380px] flex-col items-center justify-center fill-muted-foreground/70 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
      >
        <MotionConfig
          transition={{ type: "spring", duration: 0.9, bounce: 0.38 }}
        >
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            className="sr-only"
            accept="image/*,.pdf,.doc,.docx,.zip"
            onChange={onInputChange}
          />

          <motion.div
            layout
            animate={
              shock && !reduce
                ? { scale: [1, 0.93, 1.04, 1], y: [0, 12, -5, 0] }
                : {
                    scale: phase === "dragging" ? 1.025 : 1,
                    y: 0,
                  }
            }
            transition={
              shock
                ? { duration: 0.58, ease: ROW_EASE }
                : { type: "spring", bounce: 0.38, duration: 0.85 }
            }
            className={clsx(
              "relative w-full overflow-hidden border outline-none",
              idleOrDrag ? "border-dashed" : "border-solid",
              phase === "dragging"
                ? "border-primary bg-primary/10"
                : "border-border bg-card",
            )}
            style={{
              borderRadius: 22,
              borderWidth: idleOrDrag ? 2 : 1,
            }}
          >
            <Shockwave fire={shock && !reduce} />

            <AnimatePresence mode="popLayout" initial={false}>
              {idleOrDrag ? (
                <motion.div
                  key="dropzone"
                  role="button"
                  tabIndex={0}
                  aria-label="فایل را رها کن یا برای انتخاب کلیک کن"
                  onClick={() => inputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      inputRef.current?.click();
                    }
                  }}
                  onDragEnter={onDragEnter}
                  onDragLeave={onDragLeave}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    y: -32,
                    scale: 0.9,
                    filter: "blur(12px)",
                    transition: { duration: 0.38, ease: ROW_EASE },
                  }}
                  className="relative flex min-h-[268px] cursor-pointer flex-col items-center justify-center gap-5 px-6 py-12 text-center focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {!reduce ? <OrbitDots active={phase === "idle"} /> : null}

                  {!reduce && phase === "idle" ? (
                    <>
                      <motion.span
                        aria-hidden
                        className="pointer-events-none absolute size-40 rounded-full border border-border/70"
                        animate={{ scale: [1, 1.5], opacity: [0.45, 0] }}
                        transition={{
                          duration: 2.7,
                          repeat: Infinity,
                          ease: "easeOut",
                        }}
                      />
                      <motion.span
                        aria-hidden
                        className="pointer-events-none absolute size-40 rounded-full border border-primary/30"
                        animate={{ scale: [1, 1.75], opacity: [0.35, 0] }}
                        transition={{
                          duration: 2.7,
                          repeat: Infinity,
                          ease: "easeOut",
                          delay: 0.75,
                        }}
                      />
                    </>
                  ) : null}

                  <motion.div
                    layoutId={`${layoutGroup}-icon`}
                    animate={
                      phase === "dragging"
                        ? { y: -20, scale: 1.2, rotate: -14 }
                        : reduce
                          ? { y: 0, scale: 1, rotate: 0 }
                          : { y: [0, -9, 0], scale: 1, rotate: [0, -4, 0] }
                    }
                    transition={
                      phase === "dragging"
                        ? { type: "spring", bounce: 0.58, duration: 0.72 }
                        : reduce
                          ? { duration: 0 }
                          : {
                              y: {
                                duration: 2.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                              },
                              rotate: {
                                duration: 2.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                              },
                            }
                    }
                    className={clsx(
                      "relative z-[1] flex size-[92px] items-center justify-center border border-border bg-background",
                      phase === "dragging" && "border-primary",
                    )}
                    style={{ borderRadius: 46 }}
                  >
                    <motion.span
                      animate={
                        phase === "dragging" && !reduce
                          ? { y: [0, -7, 0] }
                          : { y: 0 }
                      }
                      transition={
                        phase === "dragging"
                          ? {
                              duration: 0.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }
                          : undefined
                      }
                      className={
                        phase === "dragging"
                          ? "text-primary"
                          : "text-muted-foreground"
                      }
                    >
                      <HugeiconsIcon icon={Upload04Icon} size={42} />
                    </motion.span>
                  </motion.div>

                  <div className="relative z-[1] space-y-2">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={phase === "dragging" ? "drop" : "idle"}
                        initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
                        transition={{ duration: 0.3, ease: ROW_EASE }}
                        className="text-xl font-semibold text-foreground"
                      >
                        {phase === "dragging"
                          ? "رها کن — می‌گیرمش"
                          : "فایل را پرتاب کن اینجا"}
                      </motion.p>
                    </AnimatePresence>
                    <p className="text-base text-muted-foreground">
                      {phase === "dragging"
                        ? "محصول، مدرک یا تصویر"
                        : "یا لمس کن تا از دستگاه انتخاب کنی"}
                    </p>
                  </div>

                  {phase === "dragging" && !reduce ? (
                    <motion.div
                      aria-hidden
                      className="pointer-events-none absolute inset-4 border border-primary/55"
                      style={{ borderRadius: 16 }}
                      initial={{ opacity: 0, scale: 0.88 }}
                      animate={{
                        opacity: [0.2, 1, 0.2],
                        scale: [0.96, 1.02, 0.96],
                      }}
                      transition={{ duration: 0.85, repeat: Infinity }}
                    />
                  ) : null}
                </motion.div>
              ) : null}

              {showCard && file ? (
                <motion.div
                  key="card"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.94, filter: "blur(8px)" }}
                  className="relative"
                >
                  <motion.div
                    layoutId={`${layoutGroup}-icon`}
                    className="relative mx-3 mt-3 overflow-hidden border border-border bg-background"
                    style={{ borderRadius: 18 }}
                    transition={{
                      type: "spring",
                      bounce: 0.3,
                      duration: 1,
                    }}
                  >
                    <motion.div
                      initial={reduce ? false : { height: 92 }}
                      animate={{ height: file.previewUrl ? 176 : 118 }}
                      transition={{
                        type: "spring",
                        bounce: 0.34,
                        duration: 1,
                      }}
                      className="relative w-full overflow-hidden"
                    >
                      {file.previewUrl ? (
                        <motion.img
                          src={file.previewUrl}
                          alt=""
                          className="absolute inset-0 size-full object-cover"
                          draggable={false}
                          initial={{
                            scale: 1.45,
                            y: 48,
                            rotate: -5,
                            filter: "blur(14px)",
                          }}
                          animate={{
                            scale: 1,
                            y: 0,
                            rotate: 0,
                            filter: "blur(0px)",
                          }}
                          transition={{
                            type: "spring",
                            bounce: 0.3,
                            duration: 1.15,
                          }}
                        />
                      ) : (
                        <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                          <motion.span
                            initial={{ scale: 0.35, rotate: -30, opacity: 0 }}
                            animate={{ scale: 1, rotate: 0, opacity: 1 }}
                            transition={{
                              type: "spring",
                              bounce: 0.55,
                              duration: 0.85,
                            }}
                          >
                            <HugeiconsIcon
                              icon={
                                isImage(file.type) ? Image01Icon : File01Icon
                              }
                              size={42}
                            />
                          </motion.span>
                        </div>
                      )}

                      {!reduce && phase === "uploading" ? (
                        <motion.div
                          aria-hidden
                          className="pointer-events-none absolute inset-x-0 h-20 bg-gradient-to-b from-transparent via-primary/40 to-transparent"
                          animate={{ top: ["-25%", "115%"] }}
                          transition={{
                            duration: 1.55,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      ) : null}

                      <AnimatePresence>
                        {phase === "done" ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center bg-background/55 backdrop-blur-[2px]"
                          >
                            <motion.span
                              initial={{ scale: 0, rotate: -48 }}
                              animate={{ scale: [0, 1.25, 1], rotate: 0 }}
                              transition={{
                                type: "spring",
                                bounce: 0.58,
                                duration: 0.8,
                              }}
                              className="flex size-[68px] items-center justify-center rounded-full bg-primary text-primary-foreground"
                            >
                              <HugeiconsIcon icon={Tick02Icon} size={34} />
                            </motion.span>

                            {!reduce
                              ? [0, 1, 2, 3, 4, 5].map((i) => (
                                  <motion.span
                                    key={i}
                                    aria-hidden
                                    className="absolute size-2 rounded-full bg-primary"
                                    initial={{
                                      opacity: 1,
                                      scale: 0,
                                      x: 0,
                                      y: 0,
                                    }}
                                    animate={{
                                      opacity: 0,
                                      scale: 1.4,
                                      x:
                                        Math.cos((i / 6) * Math.PI * 2) * 64,
                                      y:
                                        Math.sin((i / 6) * Math.PI * 2) * 64,
                                    }}
                                    transition={{
                                      duration: 0.7,
                                      ease: ROW_EASE,
                                      delay: 0.06,
                                    }}
                                  />
                                ))
                              : null}
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>

                  <div className="flex items-start gap-3 px-4 pt-4 pb-2">
                    <div className="min-w-0 flex-1">
                      <motion.p
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{
                          type: "spring",
                          bounce: 0.15,
                          duration: 0.6,
                          delay: 0.14,
                        }}
                        className="truncate text-xl font-semibold text-foreground"
                        title={file.name}
                      >
                        {file.name}
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          type: "spring",
                          bounce: 0.1,
                          duration: 0.45,
                          delay: 0.22,
                        }}
                        className="mt-1 text-base text-muted-foreground"
                      >
                        {formatBytes(file.size)}
                        {phase === "catching"
                          ? " · گرفتن فایل…"
                          : phase === "uploading"
                            ? " · در حال ارسال"
                            : " · آمادهٔ استفاده"}
                      </motion.p>
                    </div>

                    <motion.button
                      type="button"
                      aria-label="حذف فایل"
                      onClick={reset}
                      initial={{ opacity: 0, scale: 0.45, rotate: -24 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      whileTap={reduce ? undefined : { scale: 0.86, rotate: 10 }}
                      className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-2xl text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} size={20} />
                    </motion.button>
                  </div>

                  <div className="px-4 pb-5 pt-1">
                    <div className="mb-2.5 flex items-end justify-between gap-3">
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={phase}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="text-base text-muted-foreground"
                        >
                          {phase === "catching"
                            ? "آماده‌سازی"
                            : phase === "uploading"
                              ? "آپلود"
                              : "تمام"}
                        </motion.p>
                      </AnimatePresence>
                      <p className="text-3xl font-semibold tabular-nums leading-none text-foreground">
                        <span>{pctLabel}</span>
                        <span className="text-xl text-muted-foreground">٪</span>
                      </p>
                    </div>

                    <div
                      className="relative h-5 overflow-hidden border border-border bg-background"
                      style={{ borderRadius: 999 }}
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={progress}
                      aria-label="پیشرفت آپلود"
                    >
                      <motion.div
                        className="absolute inset-y-0 start-0 bg-primary"
                        style={{ width: barWidth, borderRadius: 999 }}
                      />

                      {!reduce &&
                      (phase === "uploading" || phase === "catching") ? (
                        <motion.div
                          aria-hidden
                          className="pointer-events-none absolute inset-y-0 start-0"
                          style={{ width: barWidth }}
                        >
                          <span className="absolute end-0 top-1/2 size-4 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary-foreground shadow-[0_0_14px_color-mix(in_oklab,var(--primary)_70%,transparent)] rtl:-translate-x-1/2" />
                        </motion.div>
                      ) : null}

                      {!reduce && phase === "uploading" ? (
                        <motion.span
                          aria-hidden
                          className="absolute inset-y-0 w-24 bg-gradient-to-l from-transparent via-white/55 to-transparent"
                          animate={{ x: ["-50%", "150%"] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                      ) : null}

                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 flex"
                      >
                        {Array.from({ length: SEGMENTS }, (_, i) => (
                          <span
                            key={i}
                            className="h-full flex-1 border-e border-border/40 last:border-e-0"
                          />
                        ))}
                      </div>
                    </div>

                    {!reduce ? (
                      <div className="mt-2.5 flex gap-1">
                        {Array.from({ length: SEGMENTS }, (_, i) => (
                          <motion.span
                            key={i}
                            className={clsx(
                              "h-1.5 flex-1 rounded-full",
                              i < litSegments ? "bg-primary" : "bg-border",
                            )}
                            animate={
                              i < litSegments
                                ? { scaleY: [1, 1.8, 1] }
                                : { scaleY: 1 }
                            }
                            transition={{
                              duration: 0.32,
                              ease: ROW_EASE,
                              delay: i * 0.01,
                            }}
                          />
                        ))}
                      </div>
                    ) : null}

                    {phase === "done" ? (
                      <motion.button
                        type="button"
                        onClick={reset}
                        initial={{ opacity: 0, y: 20, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        whileHover={reduce ? undefined : { scale: 1.025, y: -1 }}
                        whileTap={reduce ? undefined : { scale: 0.97 }}
                        transition={{
                          type: "spring",
                          bounce: 0.32,
                          duration: 0.6,
                          delay: 0.18,
                        }}
                        className="mt-4 flex w-full cursor-pointer items-center justify-center rounded-2xl border border-border bg-background px-4 py-3.5 text-base font-medium text-foreground hover:bg-accent"
                      >
                        یکی دیگه بفرست
                      </motion.button>
                    ) : null}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </MotionConfig>
      </section>
    </LayoutGroup>
  );
}
