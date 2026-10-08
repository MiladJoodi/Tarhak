import { LandingNav } from "@/components/landing/landing-nav";
import type { ReactNode } from "react";
import { getGithubStarCount } from "@/lib/github";
import { source } from "@/lib/source";
import { TreeContextProvider } from "fumadocs-ui/contexts/tree";

export default async function Layout({ children }: { children: ReactNode }) {
  const githubStars = await getGithubStarCount();
  return (
    <TreeContextProvider tree={source.pageTree}>
      <div
        lang="fa"
        dir="rtl"
        className="light min-h-svh bg-[#F5F3EE] font-[family-name:var(--font-estedad),Tahoma,Arial,sans-serif] text-[#071A31] tracking-normal"
      >
        <LandingNav githubStars={githubStars} />
        {children}
      </div>
    </TreeContextProvider>
  );
}
