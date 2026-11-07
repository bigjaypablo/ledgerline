import { createFileRoute } from "@tanstack/react-router";
import { AdvertiseView } from "@/components/editorial/advertise-view";

export const Route = createFileRoute("/advertise")({
  head: () => ({
    meta: [
      { title: "Advertise — Ledgerline" },
      {
        name: "description",
        content: "Sponsored placements and verification checks on Ledgerline.",
      },
    ],
  }),
  component: AdvertiseView,
});
