import type { Metadata } from "next";

import JalaliWheelPickerDemo from "@/registry/default/example/jalali-wheel-picker";

export const metadata: Metadata = {
  title: "Jalali Wheel Picker",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <JalaliWheelPickerDemo />
    </main>
  );
}
