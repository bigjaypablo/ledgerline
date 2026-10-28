import { createFileRoute } from "@tanstack/react-router";
import { LegalView } from "@/components/editorial/legal-view";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of use — Ledgerline" },
      { name: "description", content: "A starting draft of the terms for reading Ledgerline. Not legal advice." },
    ],
  }),
  component: () => <LegalView page="terms" />,
});
