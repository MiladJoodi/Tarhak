import type { Metadata } from "next";

import OtpCascade from "@/registry/default/example/otp-cascade";

export const metadata: Metadata = {
  title: "OTP Cascade",
  robots: { index: false, follow: false },
};

export default function OtpCascadePreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <OtpCascade />
    </main>
  );
}
