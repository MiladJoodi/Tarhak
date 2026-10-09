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
  Moon02Icon,
  Notification03Icon,
  Sun03Icon,
  Tick02Icon,
  Wifi01Icon,
} from "@hugeicons/core-free-icons";
import clsx from "clsx";

/** iOS system green */
const ON_GREEN = "#34C759";

const TRACK = { w: 52, h: 32, thumb: 26, pad: 3 } as const;
const THUMB_TRAVEL = TRACK.w - TRACK.thumb - TRACK.pad * 2;

const thumbSpring = {
  type: "spring" as const,
  stiffness: 500,
  damping: 32,
  mass: 0.75,
};

const fillSpring = {
  type: "spring" as const,
  stiffness: 380,
  damping: 36,
  mass: 0.8,
};

const softSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 28,
  mass: 0.65,
};

type SoftSwitchProps = {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  label?: string;
  "aria-label"?: string;
};

/** Pill switch — thumb slides with spring; iOS green when on. */
export function SoftSwitch({
  checked,
  onCheckedChange,
  label,
  "aria-label": ariaLabel,
}: SoftSwitchProps) {
  const reduce = useReducedMotion() ?? false;

  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel ?? label}
      onClick={() => onCheckedChange(!checked)}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      className={clsx(
        "relative inline-flex shrink-0 cursor-pointer items-center overflow-hidden border outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring",
        checked ? "border-transparent" : "border-border bg-muted/60",
      )}
      style={{
        width: TRACK.w,
        height: TRACK.h,
        borderRadius: 999,
        borderWidth: 1,
        backgroundColor: checked ? ON_GREEN : undefined,
      }}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{ backgroundColor: ON_GREEN }}
        initial={false}
        animate={{ opacity: checked ? 1 : 0 }}
        transition={{ duration: reduce ? 0.1 : 0.22 }}
      />

      <motion.span
        className="absolute top-1/2 z-1 flex -translate-y-1/2 items-center justify-center border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-card"
        style={{
          width: TRACK.thumb,
          height: TRACK.thumb,
          borderRadius: 999,
          left: TRACK.pad,
        }}
        initial={false}
        animate={{
          x: checked ? THUMB_TRAVEL : 0,
          scaleX: reduce ? 1 : [1.14, 1],
          scaleY: reduce ? 1 : [0.9, 1],
        }}
        transition={reduce ? { duration: 0.12 } : thumbSpring}
      >
        <AnimatePresence mode="wait" initial={false}>
          {checked ? (
            <motion.span
              key="on"
              initial={{ opacity: 0, scale: 0.4, rotate: -40 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 30 }}
              transition={reduce ? { duration: 0.1 } : softSpring}
            >
              <HugeiconsIcon
                icon={Tick02Icon}
                size={14}
                style={{ color: ON_GREEN }}
              />
            </motion.span>
          ) : (
            <motion.span
              key="off"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.35, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="size-1.5 rounded-full bg-muted-foreground"
            />
          )}
        </AnimatePresence>
      </motion.span>
    </motion.button>
  );
}

type IconSwitchProps = {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  "aria-label"?: string;
};

/** Day / night icon swap — same track size as SoftSwitch. */
export function IconSwitch({
  checked,
  onCheckedChange,
  "aria-label": ariaLabel,
}: IconSwitchProps) {
  const reduce = useReducedMotion() ?? false;

  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel ?? (checked ? "تم روشن" : "تم تیره")}
      onClick={() => onCheckedChange(!checked)}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      className={clsx(
        "relative inline-flex shrink-0 cursor-pointer items-center overflow-hidden border outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring",
        checked ? "border-transparent" : "border-border bg-muted/60",
      )}
      style={{
        width: TRACK.w,
        height: TRACK.h,
        borderRadius: 999,
        borderWidth: 1,
        backgroundColor: checked ? ON_GREEN : undefined,
      }}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{ backgroundColor: ON_GREEN }}
        initial={false}
        animate={{ opacity: checked ? 1 : 0 }}
        transition={{ duration: reduce ? 0.1 : 0.22 }}
      />

      <motion.span
        className="absolute top-1/2 z-1 flex -translate-y-1/2 items-center justify-center border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-card"
        style={{
          width: TRACK.thumb,
          height: TRACK.thumb,
          borderRadius: 999,
          left: TRACK.pad,
        }}
        initial={false}
        animate={{
          x: checked ? THUMB_TRAVEL : 0,
          scaleX: reduce ? 1 : [1.14, 1],
          scaleY: reduce ? 1 : [0.9, 1],
        }}
        transition={reduce ? { duration: 0.12 } : thumbSpring}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={checked ? "sun" : "moon"}
            initial={{ opacity: 0, y: 8, rotate: -24, filter: "blur(3px)" }}
            animate={{ opacity: 1, y: 0, rotate: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, rotate: 20, filter: "blur(3px)" }}
            transition={reduce ? { duration: 0.1 } : softSpring}
            className={checked ? "text-amber-500" : "text-muted-foreground"}
          >
            <HugeiconsIcon
              icon={checked ? Sun03Icon : Moon02Icon}
              size={15}
            />
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </motion.button>
  );
}

type LiquidSwitchProps = {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  "aria-label"?: string;
};

/** Liquid fill grows/shrinks under the thumb — no bounce overshoot. */
export function LiquidSwitch({
  checked,
  onCheckedChange,
  "aria-label": ariaLabel,
}: LiquidSwitchProps) {
  const reduce = useReducedMotion() ?? false;

  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel ?? "سوئیچ مایع"}
      onClick={() => onCheckedChange(!checked)}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      className="relative inline-flex shrink-0 cursor-pointer items-center overflow-hidden border border-border bg-muted/60 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{
        width: TRACK.w,
        height: TRACK.h,
        borderRadius: 999,
        borderWidth: 1,
      }}
    >
      <motion.span
        aria-hidden
        className="absolute inset-y-0 left-0 w-full rounded-full"
        style={{
          backgroundColor: ON_GREEN,
          transformOrigin: "left center",
          willChange: "transform",
        }}
        initial={false}
        animate={{ scaleX: checked ? 1 : 0 }}
        transition={reduce ? { duration: 0.15 } : fillSpring}
      />

      <motion.span
        className="absolute top-1/2 z-1 flex -translate-y-1/2 items-center justify-center border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-card"
        style={{
          width: TRACK.thumb,
          height: TRACK.thumb,
          borderRadius: 999,
          left: TRACK.pad,
        }}
        initial={false}
        animate={{
          x: checked ? THUMB_TRAVEL : 0,
          scaleX: reduce ? 1 : [1.16, 1],
          scaleY: reduce ? 1 : [0.88, 1],
        }}
        transition={reduce ? { duration: 0.12 } : thumbSpring}
      >
        <motion.span
          className="size-1.5 rounded-full"
          style={{ backgroundColor: ON_GREEN }}
          animate={{
            scale: checked ? 1 : 0.55,
            opacity: checked ? 1 : 0.35,
          }}
          transition={reduce ? { duration: 0.1 } : softSpring}
        />
      </motion.span>
    </motion.button>
  );
}

type SettingRowProps = {
  title: string;
  description: string;
  icon: typeof Wifi01Icon;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
};

function SettingRow({
  title,
  description,
  icon,
  checked,
  onCheckedChange,
}: SettingRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-accent/50">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground">
        <HugeiconsIcon icon={icon} size={22} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-base font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <SoftSwitch
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={title}
      />
    </div>
  );
}

export default function AnimatedSwitches() {
  const [wifi, setWifi] = useState(true);
  const [notify, setNotify] = useState(false);
  const [theme, setTheme] = useState(false);
  const [liquid, setLiquid] = useState(true);
  const [eco, setEco] = useState(false);

  return (
    <section
      dir="rtl"
      lang="fa"
      aria-label="سوئیچ‌های انیمیشنی"
      className="flex w-full max-w-[380px] flex-col gap-5 fill-muted-foreground/70 font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <MotionConfig transition={thumbSpring}>
        <div
          className="overflow-hidden border border-border bg-card px-2 py-2"
          style={{ borderRadius: 20, borderWidth: 1 }}
        >
          <SettingRow
            title="وای‌فای"
            description="اتصال خودکار به شبکه‌های ذخیره‌شده"
            icon={Wifi01Icon}
            checked={wifi}
            onCheckedChange={setWifi}
          />
          <SettingRow
            title="اعلان‌ها"
            description="هشدارهای فوری و خلاصه روزانه"
            icon={Notification03Icon}
            checked={notify}
            onCheckedChange={setNotify}
          />
          <SettingRow
            title="حالت کم‌مصرف"
            description="کاهش انیمیشن و مصرف باتری"
            icon={Moon02Icon}
            checked={eco}
            onCheckedChange={setEco}
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 px-2 py-2">
          <div className="flex flex-col items-center gap-2">
            <IconSwitch checked={theme} onCheckedChange={setTheme} />
            <span className="text-sm text-muted-foreground">
              {theme ? "روز" : "شب"}
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <LiquidSwitch checked={liquid} onCheckedChange={setLiquid} />
            <span className="text-sm text-muted-foreground">مایع</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <SoftSwitch
              checked={wifi}
              onCheckedChange={setWifi}
              aria-label="سوئیچ نرم"
            />
            <span className="text-sm text-muted-foreground">نرم</span>
          </div>
        </div>
      </MotionConfig>
    </section>
  );
}
