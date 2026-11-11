import { createFileRoute } from "@tanstack/react-router";
import { HomeView } from "@/components/editorial/home-view";
import { HomeSkeleton } from "@/components/editorial/skeletons";
import { getHome } from "@/lib/editorial/public";

export const Route = createFileRoute("/")({
  loader: () => getHome(),
  head: ({ loaderData }) => ({
    meta: [
      { title: "Ledgerline — Understand crypto. Decide for yourself." },
      {
        name: "description",
        content: "Plain-English crypto research: how things work, what they cost, what can go wrong, and what to check before you act. Information, not advice.",
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
