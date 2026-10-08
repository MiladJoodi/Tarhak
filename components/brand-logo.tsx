import { cn } from "@/lib/utils";

export function BrandLogo({
  invert = false,
  className,
}: {
  invert?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {/* oxlint-disable-next-line next/no-img-element */}
      <img
        src="/tarhak/favicon.png"
        alt=""
        width={30}
        height={30}
        className="size-[30px] shrink-0 rounded-[6px]"
        aria-hidden
      />
      <span
        lang="fa"
        dir="rtl"
        className={cn(
          "font-[family-name:var(--font-estedad)] text-[18px] font-medium leading-none tracking-normal",
          invert ? "text-white" : "text-[#14141A]",
        )}
      >
        طرحک
      </span>
    </span>
  );
}
