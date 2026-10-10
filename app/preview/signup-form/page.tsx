import type { Metadata } from "next";

import SignUpFormDemo from "@/registry/default/example/signup-form";

export const metadata: Metadata = {
  title: "Sign Up Form",
  robots: { index: false, follow: false },
};

export default function SignUpFormPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-8">
      <SignUpFormDemo />
    </main>
  );
}
