import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { trackPageView } from "@/lib/editorial/public";

export function PageTracker() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const first = useRef(true);

  useEffect(() => {
    let referrer = "";
    if (first.current) {
      first.current = false;
      try {
        if (document.referrer) {
          const host = new URL(document.referrer).hostname;
          if (host !== window.location.hostname) referrer = host;
        }
      } catch {
        /* ignore */
      }
    }
    void trackPageView({ data: { path, referrer } }).catch(() => {});
  }, [path]);

  return null;
}
