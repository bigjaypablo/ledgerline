import { createFileRoute } from "@tanstack/react-router";
import { LegalView } from "@/components/editorial/legal-view";

export const Route = createFileRoute("/standards")({
  head: () => ({
    meta: [
      { title: "Editorial standards — Ledgerline" },
      { name: "description", content: "How Ledgerline uses primary sources, labels, and last-checked dates." },
    ],
  }),
  component: () => <LegalView page="standards" />,
});
