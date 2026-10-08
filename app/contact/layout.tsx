import type { ReactNode } from "react";

import { LandingAtmosphere } from "@/components/landing/landing-atmosphere";
import { getGithubStarCount } from "@/lib/github";

export default async function ContactLayout({ children }: { children: ReactNode }) {
  const githubStars = await getGithubStarCount();
  return (
    <LandingAtmosphere githubStars={githubStars}>{children}</LandingAtmosphere>
  );
}
