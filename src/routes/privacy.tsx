import { createFileRoute } from "@tanstack/react-router";
import { LegalView } from "@/components/editorial/legal-view";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — Ledgerline" },
      { name: "description", content: "A starting draft of what Ledgerline stores: email, comments, and desk accounts." },
    ],
  }),
  component: () => <LegalView page="privacy" />,
});
