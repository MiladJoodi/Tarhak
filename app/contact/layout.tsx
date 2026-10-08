import type { ReactNode } from "react";

import { LandingNav } from "@/components/landing/landing-nav";
import { getGithubStarCount } from "@/lib/github";

export default async function ContactLayout({ children }: { children: ReactNode }) {
  const githubStars = await getGithubStarCount();
  return (
    <div
      lang="fa"
      dir="rtl"
      className="flex min-h-svh flex-col bg-[#F5F3EE] font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] text-[#071A31] tracking-normal antialiased"
    >
      <LandingNav githubStars={githubStars} />
      {children}
    </div>
  );
}
