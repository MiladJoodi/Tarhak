export default function OpenComponentLoading() {
  return (
    <div
      className="relative flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-[hsl(225_7%_11%)]"
      aria-busy="true"
      aria-label="در حال بارگذاری"
    >
      {/* No header chrome here — OpenExperience keeps the real toolbar mounted. */}
      <div className="flex flex-1 items-center justify-center px-6 pt-20">
        <div className="h-[min(52vh,420px)] w-full max-w-3xl animate-pulse rounded-[28px] bg-white/6" />
      </div>

      <div className="pointer-events-none absolute bottom-[18px] left-1/2 z-10 -translate-x-1/2">
        <div className="h-12 w-[min(92vw,420px)] animate-pulse rounded-full bg-white/10" />
      </div>
    </div>
  );
}
