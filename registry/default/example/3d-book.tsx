"use client";

import { useRef, useState } from "react";

export default function Component3dBook() {
  const bookRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Linear interpolation function
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!bookRef.current) return;

    const rect = bookRef.current.getBoundingClientRect();
    const cursorX = e.clientX;
    const bookCenterX = rect.left + rect.width / 2;

    // Calculate how far cursor is from center (-1 to 1)
    const distanceFromCenter = (cursorX - bookCenterX) / (rect.width / 2);

    // Map cursor position to progress
    // Left side (negative) = open (1), Right side (positive) = closed (0)
    const targetProgress = lerp(1, 0, (distanceFromCenter + 1) / 2);

    // Clamp between 0 and 1
    setProgress(Math.max(0, Math.min(1, targetProgress)));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handlePointerMove(e);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setProgress(0);
  };

  const handlePointerLeave = () => {
    // Close book when cursor leaves (only if not dragging on mobile)
    if (!isDragging) {
      setProgress(0);
    }
  };

  // Generate pages - all at same size and position
  const totalPages = 15;
  const pages = [];

  // All pages same size, different rotation angles
  for (let i = 1; i <= totalPages; i++) {
    const rotationAngle = (i + 1) * 10; // -20, -30, -40... -160

    pages.push(
      <div
        key={i}
        className="absolute h-48 md:h-72 w-32 md:w-52 rounded-lg md:rounded-2xl border border-border bg-background light"
        style={
          {
            transformStyle: "preserve-3d",
            transformOrigin: "left",
            transform: `rotateY(calc(var(--book-progress) * ${-rotationAngle}deg))`,
            zIndex: 50 + i,
            backfaceVisibility: "visible",
            "--book-progress": progress,
          } as React.CSSProperties
        }
      />
    );
  }

  return (
    <div
      dir="rtl"
      lang="fa"
      className="flex h-full w-full items-center justify-center font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal"
    >
      <div
        ref={bookRef}
        className="h-48 w-32 touch-none will-change-transform translate-x-16 md:h-72 md:w-52 md:translate-x-24"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        style={
          {
            perspective: "1500px",
            transformStyle: "preserve-3d",
            "--book-progress": progress,
          } as React.CSSProperties
        }
      >
        {/* Back Cover (underneath all pages) */}
        <div
          className="absolute h-48 md:h-72 w-32 md:w-52 rounded-lg md:rounded-2xl border-2 border-border"
          style={{
            transformStyle: "preserve-3d",
            transformOrigin: "left",
            background:
              "radial-gradient(hsl(var(--muted)) 0 1px, hsl(var(--background)) 1px 100%) 0 0 / 4px 4px",
            boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
            zIndex: 1,
          }}
        />

        {/* Pages - all same size, different rotations */}
        {pages}

        {/* Front Cover */}
        <div
          className="absolute h-48 md:h-72 w-32 md:w-52 bg-muted overflow-hidden"
          style={
            {
              transformStyle: "preserve-3d",
              transformOrigin: "left center",
              transform: `rotateY(calc(var(--book-progress) * -165deg))`,
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "0 8px 8px 0",
              zIndex: 200,
              "--book-progress": progress,
            } as React.CSSProperties
          }
        >
          {/* Cover shadow overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-30"
            style={{
              borderRadius: "0 8px 8px 0",
              boxShadow:
                "0 0 0 0.85px rgba(0, 0, 0, 0.1) inset, 2px 0 1px 0 rgba(0, 0, 0, 0.1) inset, -1.5px 0 1px 0 rgba(0, 0, 0, 0.1) inset, 0 2px 2px 0 rgba(255, 255, 255, 0.1) inset, 0 8px 16px 0 rgba(0, 0, 0, 0.05)",
            }}
          />

          {/* Red top section */}
          <div
            className="absolute inset-x-0 top-0 z-10 h-[40%] p-1.5 ps-2 md:p-3 md:ps-4"
            style={{
              backgroundColor: "rgb(187, 1, 58)",
            }}
          />

          {/* Spine edge */}
          <div className="absolute inset-y-0 start-0 z-30 flex w-2 flex-row justify-end md:w-3.5">
            <div className="h-full w-0.5 bg-background/25" />
            <div className="h-full w-0.5 bg-foreground/15" />
          </div>

          {/* Title */}
          <div
            className="pointer-events-none absolute end-1.5 bottom-1.5 start-3 z-20 select-none text-sm font-medium text-muted-foreground/30 md:start-6 md:text-2xl"
            style={{
              textShadow: "0 0 2px hsl(var(--background))",
              backfaceVisibility: "hidden",
            }}
          >
            دفترچه
          </div>

          {/* Back label */}
          <div
            className="absolute top-1/2 end-1/2 text-center text-xs font-semibold text-primary md:text-base"
            style={{
              transform: "translate(50%, -50%) rotateY(180deg) scaleX(-1)",
              backfaceVisibility: "hidden",
            }}
          >
            صفحهٔ پشت
          </div>
        </div>
      </div>
    </div>
  );
}
