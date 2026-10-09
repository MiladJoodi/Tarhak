import type { Metadata } from "next";

import TicketTear from "@/registry/default/example/ticket-tear";

export const metadata: Metadata = {
  title: "Ticket Tear",
  robots: { index: false, follow: false },
};

export default function TicketTearPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <TicketTear />
    </main>
  );
}
