import { BRAND_NAME_FA, LOGO_PATH } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function BrandLogo({
  invert = false,
  wordmark = true,
  className,
}: {
  invert?: boolean;
  /** When false, only the mark is shown (e.g. header next to a hero wordmark). */
  wordmark?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("brand-logo inline-flex items-center gap-2", className)}>
      {/* oxlint-disable-next-line next/no-img-element */}
      <img
        src={LOGO_PATH}
        alt=""
        width={40}
        height={40}
        className="brand-logo-mark size-10 shrink-0 origin-center rounded-[8px] object-contain"
        aria-hidden
      />
      {wordmark ? (
        <span
          lang="fa"
          dir="rtl"
          className={cn(
            "font-[family-name:var(--font-estedad)] text-[17px] font-medium leading-none tracking-normal",
            invert ? "text-white" : "text-[#14141A]",
          )}
        >
          {BRAND_NAME_FA}
        </span>
      ) : null}
    </span>
  );
}
