import { createFileRoute } from "@tanstack/react-router";
import { LegalView } from "@/components/editorial/legal-view";

export const Route = createFileRoute("/disclosure")({
  head: () => ({
    meta: [
      { title: "Affiliate disclosure — Ledgerline" },
      { name: "description", content: "How Ledgerline marks affiliate links, and what a commission does not mean." },
    ],
  }),
  component: () => <LegalView page="disclosure" />,
});
