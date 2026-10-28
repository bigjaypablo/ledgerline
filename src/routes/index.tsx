import { createFileRoute } from "@tanstack/react-router";
import { HomeView } from "@/components/editorial/home-view";
import { HomeSkeleton } from "@/components/editorial/skeletons";
import { getHome } from "@/lib/editorial/public";

export const Route = createFileRoute("/")({
  loader: () => getHome(),
  head: ({ loaderData }) => ({
    meta: [
      { title: "Ledgerline — Research before you pay." },
      {
        name: "description",
        content:
          loaderData?.settings.tagline ||
          "Independent research on cryptocurrency, AI tools, and software subscriptions.",
      },
    ],
  }),
  pendingComponent: HomeSkeleton,
  pendingMs: 200,
  component: HomePage,
});

function HomePage() {
  const data = Route.useLoaderData();
  return <HomeView data={data} />;
}
