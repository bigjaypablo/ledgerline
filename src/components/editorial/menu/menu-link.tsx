import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

type To = "/crypto" | "/ai" | "/saas" | "/guides" | "/comparisons" | "/research" | "/archive" | "/opportunities";

export function MenuLink({ to, onNavigate, children }: { to: To; onNavigate: () => void; children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const active = path === to || path.startsWith(`${to}/`);
  return (
    <Link
      to={to}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-11 items-center text-[17px] font-semibold ${active ? "text-accent" : "hover:text-accent"}`}
    >
      {children}
    </Link>
  );
}
