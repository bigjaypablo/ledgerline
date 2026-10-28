import { createFileRoute } from "@tanstack/react-router";
import { publicOrigin } from "@/lib/editorial/feeds";
import { getFeedDocument } from "@/lib/editorial/public";

export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const body = await getFeedDocument({ data: { kind: "rss", origin: publicOrigin(request) } });
        return new Response(body, {
          headers: {
            "content-type": "application/rss+xml; charset=utf-8",
            "cache-control": "public, max-age=300",
          },
        });
      },
    },
  },
});
