"use client";

import { useState } from "react";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useReducedMotion,
} from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail01Icon,
  Notification03Icon,
  TaskDaily01Icon,
} from "@hugeicons/core-free-icons";
import clsx from "clsx";

const ON_GREEN = "#34C759";

const boxSpring = {
  type: "spring" as const,
  stiffness: 520,
  damping: 26,
  mass: 0.65,
};

const drawTween = {
  type: "tween" as const,
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

type BoxSize = "md" | "lg";

const SIZE: Record<
  BoxSize,
  { box: number; stroke: number; radius: number; pad: number }
> = {
  md: { box: 24, stroke: 2.6, radius: 7, pad: 3 },
  lg: { box: 30, stroke: 2.8, radius: 9, pad: 4 },
};

/** Check path — always remounts on check so pathLength never sticks. */
function CheckMark({
  checked,
  size,
  reduce,
  delay = 0.06,
}: {
  checked: boolean;
  size: BoxSize;
  reduce: boolean;
  delay?: number;
}) {
  const s = SIZE[size];

  return (
    <svg
      width={s.box}
      height={s.box}
      viewBox="0 0 24 24"
      fill="none"
      className="pointer-events-none absolute inset-0 z-2"
      aria-hidden
    >
      <AnimatePresence initial={false}>
        {checked ? (
          <motion.path
            key="tick"
            d="M6.2 12.4 L10.1 16.3 L17.8 7.8"
            fill="none"
            stroke="#ffffff"
            strokeWidth={s.stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            initial={
              reduce
                ? { pathLength: 1, opacity: 1 }
                : { pathLength: 0, opacity: 1 }
            }
            animate={{ pathLength: 1, opacity: 1 }}
            exit={{ pathLength: 0, opacity: 0, transition: { duration: 0.12 } }}
            transition={
              reduce
                ? { duration: 0.08 }
                : { ...drawTween, delay }
            }
          />
        ) : null}
      </AnimatePresence>
    </svg>
  );
}

/** Expanding ring flash when turning on. */
function PopRing({
  active,
  radius,
  reduce,
}: {
  active: boolean;
  radius: number;
  reduce: boolean;
}) {
  if (reduce) return null;
  return (
    <AnimatePresence>
      {active ? (
        <motion.span
          key="ring"
          aria-hidden
          className="pointer-events-none absolute inset-0 border-2"
          style={{ borderRadius: radius, borderColor: ON_GREEN }}
          initial={{ scale: 0.85, opacity: 0.7 }}
          animate={{ scale: 1.55, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        />
      ) : null}
    </AnimatePresence>
  );
}

type SoftCheckboxProps = {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  size?: BoxSize;
  "aria-label"?: string;
};

/** Fill scales from center; check remounts and draws every time. */
export function SoftCheckbox({
  checked,
  onCheckedChange,
  size = "md",
  "aria-label": ariaLabel,
}: SoftCheckboxProps) {
  const reduce = useReducedMotion() ?? false;
  const s = SIZE[size];

  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel ?? "چک‌باکس"}
      onClick={() => onCheckedChange(!checked)}
      whileTap={reduce ? undefined : { scale: 0.88 }}
      className={clsx(
        "relative inline-flex shrink-0 cursor-pointer items-center justify-center overflow-visible border outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring",
        checked ? "border-transparent" : "border-border bg-background",
      )}
      style={{
        width: s.box,
        height: s.box,
        borderRadius: s.radius,
        borderWidth: 1.5,
        backgroundColor: checked ? ON_GREEN : undefined,
      }}
      initial={false}
    >
      <PopRing active={checked} radius={s.radius} reduce={reduce} />

      <motion.span
        key={checked ? "fill-on" : "fill-off"}
        aria-hidden
        className="absolute inset-0 z-1 origin-center"
        style={{ borderRadius: s.radius, backgroundColor: ON_GREEN }}
        initial={
          reduce ? false : { scale: checked ? 0.55 : 1 }
        }
        animate={{ scale: checked ? 1 : 0 }}
        transition={
          reduce
            ? { duration: 0.1 }
            : { type: "spring", stiffness: 460, damping: 22, mass: 0.65 }
        }
      />

      <CheckMark checked={checked} size={size} reduce={reduce} />
    </motion.button>
  );
}

type CircleCheckboxProps = {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  size?: BoxSize;
  "aria-label"?: string;
};

/** Ring sweeps closed, then fill + check. */
export function CircleCheckbox({
  checked,
  onCheckedChange,
  size = "md",
  "aria-label": ariaLabel,
}: CircleCheckboxProps) {
  const reduce = useReducedMotion() ?? false;
  const s = SIZE[size];
  const r = 10;
  const c = 2 * Math.PI * r;

  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel ?? "چک‌باکس دایره‌ای"}
      onClick={() => onCheckedChange(!checked)}
      whileTap={reduce ? undefined : { scale: 0.88 }}
      className={clsx(
        "relative inline-flex shrink-0 cursor-pointer items-center justify-center overflow-visible border outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring",
        checked ? "border-transparent" : "border-border bg-background",
      )}
      style={{
        width: s.box,
        height: s.box,
        borderRadius: 999,
        borderWidth: 1.5,
        backgroundColor: checked ? ON_GREEN : undefined,
      }}
      initial={false}
    >
      <PopRing active={checked} radius={999} reduce={reduce} />

      <svg
        width={s.box}
        height={s.box}
        viewBox="0 0 24 24"
        className="pointer-events-none absolute inset-0 z-1"
        aria-hidden
      >
        <motion.circle
          cx="12"
          cy="12"
          r={r}
          fill="none"
          stroke={ON_GREEN}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{
            strokeDashoffset: checked ? 0 : c,
            opacity: checked ? (reduce ? 1 : [1, 1, 0]) : 0.35,
          }}
          transition={
            reduce
              ? { duration: 0.12 }
              : {
                  strokeDashoffset: { ...drawTween, duration: 0.34 },
                  opacity: { duration: 0.45, times: [0, 0.55, 1] },
                }
          }
          style={{ rotate: -90, transformOrigin: "12px 12px" }}
        />
      </svg>

      <motion.span
        key={checked ? "disk-on" : "disk-off"}
        aria-hidden
        className="absolute inset-[3px] z-1 rounded-full"
        style={{ backgroundColor: ON_GREEN }}
        initial={reduce ? false : { scale: checked ? 0.35 : 1 }}
        animate={{ scale: checked ? 1 : 0 }}
        transition={
          reduce
            ? { duration: 0.1 }
            : {
                type: "spring",
                stiffness: 480,
                damping: 20,
                mass: 0.6,
                delay: checked ? 0.1 : 0,
              }
        }
      />

      <CheckMark checked={checked} size={size} reduce={reduce} delay={0.14} />
    </motion.button>
  );
}

type BurstCheckboxProps = {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  size?: BoxSize;
  "aria-label"?: string;
};

/** Squash + spark dashes, then check. */
export function BounceCheckbox({
  checked,
  onCheckedChange,
  size = "md",
  "aria-label": ariaLabel,
}: BurstCheckboxProps) {
  const reduce = useReducedMotion() ?? false;
  const s = SIZE[size];
  const sparks = [0, 60, 120, 180, 240, 300];

  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel ?? "چک‌باکس جهشی"}
      onClick={() => onCheckedChange(!checked)}
      whileTap={reduce ? undefined : { scale: 0.86 }}
      className={clsx(
        "relative inline-flex shrink-0 cursor-pointer items-center justify-center overflow-visible border outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring",
        checked ? "border-transparent" : "border-border bg-muted/40",
      )}
      style={{
        width: s.box,
        height: s.box,
        borderRadius: s.radius,
        borderWidth: 1.5,
        backgroundColor: checked ? ON_GREEN : undefined,
      }}
      initial={false}
      animate={
        reduce
          ? undefined
          : {
              scale: checked ? [0.72, 1.16, 1] : 1,
              rotate: checked ? [0, -8, 0] : 0,
            }
      }
      transition={
        reduce
          ? { duration: 0.1 }
          : {
              duration: 0.42,
              ease: [0.22, 1, 0.36, 1],
              times: checked ? [0, 0.45, 1] : undefined,
            }
      }
    >
      <AnimatePresence>
        {!reduce && checked
          ? sparks.map((deg) => (
              <motion.span
                key={deg}
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-[2.5px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ backgroundColor: ON_GREEN }}
                initial={{ opacity: 0.95, rotate: deg, y: 0, scaleY: 0.35 }}
                animate={{ opacity: 0, rotate: deg, y: -15, scaleY: 1.7 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              />
            ))
          : null}
      </AnimatePresence>

      <motion.span
        aria-hidden
        className="absolute inset-0 origin-center"
        style={{ borderRadius: s.radius, backgroundColor: ON_GREEN }}
        initial={false}
        animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
        transition={
          reduce
            ? { duration: 0.1 }
            : { type: "spring", stiffness: 500, damping: 20, mass: 0.6 }
        }
      />

      <CheckMark checked={checked} size={size} reduce={reduce} delay={0.08} />
    </motion.button>
  );
}

type TaskRowProps = {
  title: string;
  description: string;
  icon: typeof TaskDaily01Icon;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  variant?: "soft" | "circle" | "bounce";
};

function TaskRow({
  title,
  description,
  icon,
  checked,
  onCheckedChange,
  variant = "soft",
}: TaskRowProps) {
  const Box =
    variant === "circle"
      ? CircleCheckbox
      : variant === "bounce"
        ? BounceCheckbox
        : SoftCheckbox;

  return (
    <div className="flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-accent/50">
      <Box
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={title}
      />
      <button
        type="button"
        onClick={() => onCheckedChange(!checked)}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-start outline-none"
      >
        <motion.span
          className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground"
          animate={{
            scale: checked ? 0.94 : 1,
            opacity: checked ? 0.55 : 1,
          }}
          transition={boxSpring}
        >
          <HugeiconsIcon icon={icon} size={22} />
        </motion.span>
        <div className="min-w-0 flex-1">
          <span className="relative inline-block max-w-full">
            <p
              className={clsx(
                "text-base font-medium transition-colors",
                checked ? "text-muted-foreground" : "text-foreground",
              )}
            >
              {title}
            </p>
            <motion.span
              aria-hidden
              className="pointer-events-none absolute start-0 top-1/2 h-px origin-right bg-muted-foreground"
              style={{ width: "100%" }}
              initial={false}
              animate={{ scaleX: checked ? 1 : 0, opacity: checked ? 0.85 : 0 }}
              transition={drawTween}
            />
          </span>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </button>
    </div>
  );
}

export default function AnimatedCheckboxes() {
  const [tasks, setTasks] = useState({
    mail: true,
    notify: false,
    daily: false,
  });
  const [circle, setCircle] = useState(true);
  const [bounce, setBounce] = useState(false);
  const [soft, setSoft] = useState(true);

  function setTask(key: keyof typeof tasks, next: boolean) {
    setTasks((prev) => ({ ...prev, [key]: next }));
  }

  return (
    <section
      dir="rtl"
      lang="fa"
      aria-label="چک‌باکس‌های انیمیشنی"
      className="flex w-full max-w-[380px] flex-col gap-5 fill-muted-foreground/70 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <MotionConfig transition={boxSpring}>
        <div
          className="overflow-hidden border border-border bg-card px-2 py-2"
          style={{ borderRadius: 20, borderWidth: 1 }}
        >
          <TaskRow
            title="پاسخ ایمیل‌ها"
            description="صندوق ورودی امروز را خالی کن"
            icon={Mail01Icon}
            checked={tasks.mail}
            onCheckedChange={(v) => setTask("mail", v)}
            variant="soft"
          />
          <TaskRow
            title="اعلان‌های پروژه"
            description="خلاصهٔ روزانه را مرور کن"
            icon={Notification03Icon}
            checked={tasks.notify}
            onCheckedChange={(v) => setTask("notify", v)}
            variant="circle"
          />
          <TaskRow
            title="لیست کارهای روزانه"
            description="سه کار اولویت‌دار را ببند"
            icon={TaskDaily01Icon}
            checked={tasks.daily}
            onCheckedChange={(v) => setTask("daily", v)}
            variant="bounce"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 px-2 py-2">
          <div className="flex flex-col items-center gap-2">
            <SoftCheckbox
              checked={soft}
              onCheckedChange={setSoft}
              size="lg"
              aria-label="چک‌باکس نرم"
            />
            <span className="text-sm text-muted-foreground">نرم</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <CircleCheckbox
              checked={circle}
              onCheckedChange={setCircle}
              size="lg"
              aria-label="چک‌باکس دایره"
            />
            <span className="text-sm text-muted-foreground">حلقه</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <BounceCheckbox
              checked={bounce}
              onCheckedChange={setBounce}
              size="lg"
              aria-label="چک‌باکس جرقه‌ای"
            />
            <span className="text-sm text-muted-foreground">جرقه</span>
          </div>
        </div>
      </MotionConfig>
    </section>
  );
}
