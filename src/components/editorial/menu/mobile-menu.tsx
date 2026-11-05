import { Search, X } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { COVERAGE, LIBRARY } from "./menu-data";
import { MenuAbout } from "./menu-about";
import { MenuLink } from "./menu-link";
import { MenuOpportunities } from "./menu-opportunities";
import { MenuSection } from "./menu-section";

type Props = {
  open: boolean;
  onClose: () => void;
  q: string;
  onQ: (value: string) => void;
  onSearch: (event: FormEvent) => void;
  account: ReactNode;
};

export function MobileMenu({ open, onClose, q, onQ, onSearch, account }: Props) {
  if (!open) return null;
  return (
    <div id="site-menu" className="fixed inset-0 z-50 overflow-y-auto bg-card text-ink">
      <div className="sticky top-0 z-10 bg-card pb-3">
        <div className="sheet flex h-16 items-center justify-between">
          <button type="button" className="inline-flex min-h-11 min-w-11 items-center justify-center" onClick={onClose}>
            <X className="size-6" aria-hidden />
            <span className="sr-only">Close menu</span>
          </button>
          <span className="font-logo text-2xl font-semibold">Ledgerline</span>
          {account}
        </div>
        <form onSubmit={onSearch} className="sheet flex">
          <label className="sr-only" htmlFor="menu-search">
            Search news, topics and more
          </label>
          <input
            id="menu-search"
            value={q}
            onChange={(event) => onQ(event.target.value)}
            placeholder="Search news, topics and more"
            className="min-h-12 flex-1 border border-ink bg-card px-3"
          />
          <button type="submit" className="inline-flex min-h-12 min-w-12 items-center justify-center bg-ink text-inverse-fg" aria-label="Search">
            <Search className="size-5" />
          </button>
        </form>
      </div>
      <nav className="sheet space-y-5 pt-2 pb-12" aria-label="Menu">
        <MenuOpportunities onNavigate={onClose} />
        <MenuSection label="Coverage">
          {COVERAGE.map((i) => (
            <MenuLink key={i.to} to={i.to} onNavigate={onClose}>{i.label}</MenuLink>
          ))}
        </MenuSection>
        <MenuSection label="Library">
          {LIBRARY.map((i) => (
            <MenuLink key={i.to} to={i.to} onNavigate={onClose}>{i.label}</MenuLink>
          ))}
        </MenuSection>
        <MenuAbout onNavigate={onClose} />
      </nav>
    </div>
  );
}
