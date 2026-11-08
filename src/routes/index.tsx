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
          "Independent crypto research: exchanges, wallets, custody and the primary sources behind them.",
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
