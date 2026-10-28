import { createFileRoute } from "@tanstack/react-router";
import { LegalView } from "@/components/editorial/legal-view";

export const Route = createFileRoute("/corrections")({
  head: () => ({
    meta: [
      { title: "Corrections — Ledgerline" },
      { name: "description", content: "How to send a correction, and how Ledgerline records a material fix." },
    ],
  }),
  component: () => <LegalView page="corrections" />,
});
