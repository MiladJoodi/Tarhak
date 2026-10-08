import type { ReactNode } from "react";
import Image from "next/image";

import { LandingNav } from "@/components/landing/landing-nav";

/** Shared dark hero atmosphere used by contact, docs, and similar surfaces. */
export function LandingAtmosphere({
  children,
  githubStars,
}: {
  children: ReactNode;
  githubStars?: number | null;
}) {
  return (
    <div
      lang="fa"
      dir="rtl"
      className="relative flex min-h-svh flex-col bg-[#0c0d12] font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] tracking-normal text-white antialiased"
    >
      {/* Clip blooms here — overflow on this shell breaks sticky TOC. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <Image
          src="/landing/hero-bg.png"
          alt=""
          fill
          priority
          className="object-cover opacity-[0.92] saturate-[0.85] contrast-[1.08]"
          sizes="100vw"
        />
        <div className="absolute -start-[10%] top-[-20%] h-[70%] w-[70%] rounded-full bg-[radial-gradient(circle,rgba(120,150,255,0.22)_0%,transparent_68%)] blur-2xl" />
        <div className="absolute -end-[8%] bottom-[-15%] h-[55%] w-[55%] rounded-full bg-[radial-gradient(circle,rgba(255,170,120,0.14)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(85%_75%_at_50%_20%,rgba(10,12,18,0.2)_0%,rgba(8,9,14,0.55)_55%,rgba(6,7,10,0.82)_100%)]" />
      </div>

      <div className="relative z-10 flex min-h-svh flex-col">
        <LandingNav githubStars={githubStars} tone="dark" overlay />
        {children}
      </div>
    </div>
  );
}
