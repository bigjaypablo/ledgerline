import { createFileRoute } from "@tanstack/react-router";
import { LegalView } from "@/components/editorial/legal-view";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Research disclaimer — Ledgerline" },
      { name: "description", content: "Ledgerline is information, not financial advice and not a product test." },
    ],
  }),
  component: () => <LegalView page="disclaimer" />,
});
