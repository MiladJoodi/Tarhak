import type { ReactNode } from "react";
import { TreeContextProvider } from "fumadocs-ui/contexts/tree";

import { LandingAtmosphere } from "@/components/landing/landing-atmosphere";
import { getGithubStarCount } from "@/lib/github";
import { source } from "@/lib/source";

export default async function Layout({ children }: { children: ReactNode }) {
  const githubStars = await getGithubStarCount();
  return (
    <TreeContextProvider tree={source.pageTree}>
      <LandingAtmosphere githubStars={githubStars}>{children}</LandingAtmosphere>
    </TreeContextProvider>
  );
}
