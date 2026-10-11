import type { Metadata } from "next";

import ProfileCardDemo from "@/registry/default/example/profile-card";

export const metadata: Metadata = {
  title: "Profile Card",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background">
      <ProfileCardDemo />
    </main>
  );
}
