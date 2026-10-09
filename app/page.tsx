import type { Metadata } from "next";

import ComingSoon from "@/components/landing/coming-soon";

export const metadata: Metadata = {
  title: "طرحک — به‌زودی",
  description: "طرحک به‌زودی معرفی می‌شود.",
};

export default function Page() {
  return <ComingSoon />;
}
