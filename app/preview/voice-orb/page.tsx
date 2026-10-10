import type { Metadata } from "next";

import VoiceOrbDemo from "@/registry/default/example/voice-orb";

export const metadata: Metadata = {
  title: "Voice Orb",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-8">
      <VoiceOrbDemo />
    </main>
  );
}
