import { createFileRoute } from "@tanstack/react-router";
import { publicOrigin } from "@/lib/editorial/feeds";
import { getFeedDocument } from "@/lib/editorial/public";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const body = await getFeedDocument({ data: { kind: "sitemap", origin: publicOrigin(request) } });
        return new Response(body, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=300",
          },
        });
      },
    },
  },
});
