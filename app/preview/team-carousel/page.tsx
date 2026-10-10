import type { Metadata } from "next";

import TeamCarouselDemo from "@/registry/default/example/team-carousel";

export const metadata: Metadata = {
  title: "Team Carousel",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background">
      <TeamCarouselDemo />
    </main>
  );
}
