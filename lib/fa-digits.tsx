import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cn } from "@/lib/utils";

/** Extended Arabic-Indic digits (Persian). */
const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

/** Class paired with globals.css `.fa-num` digit tightening. */
export const faNumClass = "fa-num";

/** Convert ASCII digits to Persian digits. Leaves other characters untouched. */
export function toFaDigits(value: string | number) {
  return String(value).replace(/\d/g, (digit) => FA_DIGITS[Number(digit)] ?? digit);
}

type FaDigitsProps<T extends ElementType = "span"> = {
  value: string | number;
  as?: T;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "value">;

/**
 * Render Persian digits with tight spacing.
 * Chromium ignores `letter-spacing` between Arabic-script digits, so each
 * glyph is a span with a negative end margin (see globals.css `.fa-num`).
 * Prefer plain `toFaDigits` + `.fa-num` (scaleX) when using `bg-clip-text`.
 */
export function FaDigits<T extends ElementType = "span">({
  value,
  as,
  className,
  ...props
}: FaDigitsProps<T>) {
  const Comp = (as ?? "span") as ElementType;
  const text = toFaDigits(value);
  const ariaLabel =
    typeof (props as { "aria-label"?: string })["aria-label"] === "string"
      ? (props as { "aria-label"?: string })["aria-label"]
      : text;

  return (
    <Comp
      dir="ltr"
      data-fa-num
      className={cn(faNumClass, className)}
      {...props}
      aria-label={ariaLabel}
    >
      {[...text].map((ch, i) => (
        <span key={`${i}-${ch}`} aria-hidden="true">
          {ch}
        </span>
      ))}
    </Comp>
  );
}
