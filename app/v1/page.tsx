import type { Metadata } from "next";

import LandingPage from "@/components/landing/landing-page";
import { BRAND_NAME_FA } from "@/lib/brand";
import { getGithubStarCount } from "@/lib/github";
import { getLandingHeroItems } from "@/lib/landing/hero-components";

export const metadata: Metadata = {
  title: BRAND_NAME_FA,
  description:
    "کامپوننت‌های متحرک React برای پروژه‌های واقعی",
  robots: { index: false, follow: false },
};

export default async function LandingV1Route() {
  const [heroItems, githubStars] = await Promise.all([
    getLandingHeroItems(),
    getGithubStarCount(),
  ]);

  return <LandingPage heroItems={heroItems} githubStars={githubStars} />;
}
