import { createFileRoute } from "@tanstack/react-router";
import { publicOrigin } from "@/lib/editorial/feeds";
import { getPublicSettings } from "@/lib/editorial/public";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const settings = await getPublicSettings();
        const base = (settings.publicUrl || publicOrigin(request)).replace(/\/$/, "");
        const lines = [
          "User-agent: *",
          "Allow: /",
          "Disallow: /admin",
          "Disallow: /account",
          "Disallow: /desk",
          "Disallow: /login",
          "Disallow: /search",
          "Disallow: /unsubscribe",
        ];
        if (base) lines.push("", `Sitemap: ${base}/sitemap.xml`);
        return new Response(`${lines.join("\n")}\n`, {
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      },
    },
  },
});
