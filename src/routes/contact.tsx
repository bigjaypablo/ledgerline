import { createFileRoute } from "@tanstack/react-router";
import { ContactView } from "@/components/editorial/legal-view";
import { getPublicSettings } from "@/lib/editorial/public";

export const Route = createFileRoute("/contact")({
  loader: () => getPublicSettings(),
  head: () => ({
    meta: [
      { title: "Contact — Ledgerline" },
      { name: "description", content: "Send a correction or a note to the Ledgerline desk." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return <ContactView settings={Route.useLoaderData()} />;
}
