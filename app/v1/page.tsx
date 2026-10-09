import type { Metadata } from "next";

import LandingPage from "@/components/landing/landing-page";
import { getGithubStarCount } from "@/lib/github";
import { getLandingHeroItems } from "@/lib/landing/hero-components";

export const metadata: Metadata = {
  title: "طرحک",
  description:
    "کامپوننت‌هایی که قبل از کپی، حس محصول را نشان می‌دهند — نه اسکرین‌شات تخت.",
  robots: { index: false, follow: false },
};

export default async function LandingV1Route() {
  const [heroItems, githubStars] = await Promise.all([
    getLandingHeroItems(),
    getGithubStarCount(),
  ]);

  return <LandingPage heroItems={heroItems} githubStars={githubStars} />;
}
