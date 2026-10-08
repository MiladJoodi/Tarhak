"use client"

import {
  animate,
  motion,
  type MotionValue,
  useMotionValue,
  useTransform,
} from "motion/react"
import type { ComponentProps, ComponentPropsWithoutRef, JSX } from "react"
import { createContext, useCallback, useContext, useRef, useState } from "react"

import { cn } from "@/lib/utils"

type SlideToUnlockContextValue = {
  x: MotionValue<number>
  trackRef: React.RefObject<HTMLDivElement | null>
  isDragging: boolean
  handleWidth: number
  textOpacity: MotionValue<number>
  dir: "ltr" | "rtl"
  onDragStart: () => void
  onDragEnd: () => void
}

const SlideToUnlockContext = createContext<SlideToUnlockContextValue | null>(
  null
)

function useSlideToUnlock() {
  const context = useContext(SlideToUnlockContext)
  if (!context) {
    throw new Error(
      `SlideToUnlock components must be used within SlideToUnlock`
    )
  }
  return context
}

export type SlideToUnlockRootProps = ComponentProps<"div"> & {
  /**
   * Width of the drag handle in pixels.
   * @defaultValue 56
   * */
  handleWidth?: number
  /** Slide direction. RTL starts the handle on the right and unlocks leftward. */
  dir?: "ltr" | "rtl"
  /** Called when the handle is dragged fully to the end. */
  onUnlock?: () => void
}

export function SlideToUnlock({
  className,
  handleWidth = 56,
  dir = "ltr",
  children,
  onUnlock,
  ...props
}: SlideToUnlockRootProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const x = useMotionValue(0)
  const isRtl = dir === "rtl"

  const fadeDistance = handleWidth
  const textOpacity = useTransform(
    x,
    isRtl ? [0, -fadeDistance] : [0, fadeDistance],
    [1, 0],
  )

  const handleDragStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)

    const trackWidth = trackRef.current?.offsetWidth || 0
    const maxX = trackWidth - handleWidth
    const unlocked = isRtl ? x.get() <= -maxX : x.get() >= maxX

    if (unlocked) {
      onUnlock?.()
    } else {
      animate(x, 0, { type: "spring", bounce: 0, duration: 0.25 })
    }
  }, [x, onUnlock, handleWidth, isRtl])

  return (
    <SlideToUnlockContext.Provider
      value={{
        x,
        trackRef,
        isDragging,
        handleWidth,
        textOpacity,
        dir,
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
      }}
    >
      <div
        data-slot="slide-to-unlock"
        dir={dir}
        className={cn(
          "w-54 rounded-xl bg-muted p-1 shadow-inner ring-1 ring-foreground/10 ring-inset",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </SlideToUnlockContext.Provider>
  )
}

export type SlideToUnlockTrackProps = ComponentProps<"div">

export function SlideToUnlockTrack({
  className,
  children,
  ...props
}: SlideToUnlockTrackProps) {
  const { trackRef } = useSlideToUnlock()

  return (
    <div
      ref={trackRef}
      data-slot="track"
      className={cn(
        "relative flex h-10 items-center justify-center",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export type SlideToUnlockTextProps = Omit<
  ComponentPropsWithoutRef<typeof motion.div>,
  "children"
> & {
  /**
   * Accepts a render function as `children` to react to the dragging state.
   *
   * @example
   * ```tsx
   * <SlideToUnlockText>
   *   {({ isDragging }) => <span>{isDragging ? "Release..." : "Slide to unlock"}</span>}
   * </SlideToUnlockText>
   * ```
   */
  children: JSX.Element | ((props: { isDragging: boolean }) => JSX.Element)
}

export function SlideToUnlockText({
  className,
  children,
  style,
  ...props
}: SlideToUnlockTextProps) {
  const { handleWidth, textOpacity, isDragging, dir } = useSlideToUnlock()
  const isRtl = dir === "rtl"

  return (
    <motion.div
      data-slot="text"
      data-dragging={isDragging}
      className={cn("ps-1 text-lg font-medium", className)}
      style={{
        ...(isRtl
          ? { marginRight: handleWidth }
          : { marginLeft: handleWidth }),
        opacity: textOpacity,
        ...style,
      }}
      {...props}
    >
      {typeof children === "function" ? children({ isDragging }) : children}
    </motion.div>
  )
}

export type SlideToUnlockHandleProps = ComponentPropsWithoutRef<
  typeof motion.div
>

export function SlideToUnlockHandle({
  className,
  children,
  style,
  ...props
}: SlideToUnlockHandleProps) {
  const {
    x,
    trackRef,
    onDragStart,
    onDragEnd,
    handleWidth: width,
    dir,
  } = useSlideToUnlock()
  const isRtl = dir === "rtl"

  return (
    <motion.div
      data-slot="handle"
      role="slider"
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "absolute top-0 flex h-10 cursor-grab items-center justify-center rounded-lg bg-background text-muted-foreground shadow-sm active:cursor-grabbing",
        isRtl ? "right-0" : "left-0",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-6",
        className
      )}
      style={{ width, x, ...style }}
      drag="x"
      dragConstraints={trackRef}
      dragElastic={0}
      dragMomentum={false}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      {...props}
    >
      {children ?? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M24 12 12.75 3v4.696H0v8.608h12.75V21z"
            fill="currentColor"
          />
        </svg>
      )}
    </motion.div>
  )
}
