import { createFileRoute } from "@tanstack/react-router";
import { LegalView } from "@/components/editorial/legal-view";
import { getPublicSettings } from "@/lib/editorial/public";

export const Route = createFileRoute("/about")({
  loader: () => getPublicSettings(),
  head: () => ({
    meta: [
      { title: "About Ledgerline" },
      { name: "description", content: "What Ledgerline is, and what it does not claim to be." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return <LegalView page="about" settings={Route.useLoaderData()} />;
}
