import { cn } from "@/lib/utils";

/** Clean filled star mark for GitHub CTA. */
export function BrandStar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={16}
      height={16}
      aria-hidden
      className={cn("size-4 shrink-0", className)}
    >
      <path
        fill="currentColor"
        d="M8 1.2l1.76 3.56 3.93.57-2.84 2.77.67 3.91L8 10.16l-3.52 1.85.67-3.91L2.31 5.33l3.93-.57L8 1.2z"
      />
    </svg>
  );
}
