import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { subscribe } from "@/lib/editorial/public";
import { PriceTicker } from "@/components/editorial/ticker";

export const NAV = [
  { to: "/crypto", label: "Crypto" },
  { to: "/ai", label: "AI" },
  { to: "/saas", label: "SaaS" },
  { to: "/guides", label: "Guides" },
  { to: "/comparisons", label: "Reviews" },
  { to: "/research", label: "Research" },
  { to: "/archive", label: "Archive" },
] as const;

const MORE = [
  { to: "/about", label: "About" },
  { to: "/standards", label: "Editorial standards" },
  { to: "/corrections", label: "Corrections" },
  { to: "/disclosure", label: "Affiliate disclosure" },
  { to: "/disclaimer", label: "Research disclaimer" },
  { to: "/contact", label: "Contact" },
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
] as const;

function AccountLink({ className }: { className: string }) {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <span className={`${className} bg-line`} aria-hidden />;
  if (user) {
    return (
      <Link to="/account" className={className}>
        Account
      </Link>
    );
  }
  return (
    <Link to="/login" className={className}>
      Sign in
    </Link>
  );
}

export function SiteHeader() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  function goSearch(event: React.FormEvent) {
    event.preventDefault();
    setOpen(false);
    void navigate({ to: "/search", search: { q } });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-card">
      <PriceTicker />
      <div className="h-1 bg-accent" />
      <div className="sheet flex h-16 items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-6" aria-hidden />
            <span className="sr-only">Open menu</span>
          </button>
          <Link
            to="/search"
            search={{ q: "" }}
            className="inline-flex min-h-11 min-w-11 items-center justify-center"
            aria-label="Search"
          >
            <Search className="size-5" aria-hidden />
          </Link>
        </div>
        <Link to="/" className="absolute left-1/2 -translate-x-1/2 text-center">
          <span className="block font-serif text-2xl font-semibold leading-none tracking-tight sm:text-3xl">
            Ledgerline
          </span>
          <span className="mt-1 block h-0.5 bg-accent" />
        </Link>
        <AccountLink className="inline-flex min-h-11 items-center bg-ink px-3 text-sm font-semibold text-inverse-fg" />
      </div>
      <nav className="hidden border-t border-line md:block" aria-label="Sections">
        <ul className="sheet flex gap-6 py-2 text-sm font-semibold">
          {NAV.map((item) => (
            <li key={item.to}>
              <Link to={item.to} className="inline-flex min-h-11 items-center hover:text-accent">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {open ? (
        <div id="site-menu" className="fixed inset-0 z-50 overflow-y-auto bg-card text-ink">
          <div className="sheet flex h-16 items-center justify-between">
            <button type="button" className="inline-flex min-h-11 min-w-11 items-center justify-center" onClick={() => setOpen(false)}>
              <X className="size-6" aria-hidden />
              <span className="sr-only">Close menu</span>
            </button>
            <span className="font-serif text-2xl font-semibold">Ledgerline</span>
            <AccountLink className="inline-flex min-h-11 items-center px-2 text-sm font-semibold" />
          </div>
          <form onSubmit={goSearch} className="sheet mt-2 flex">
            <label className="sr-only" htmlFor="menu-search">
              Search news, topics and more
            </label>
            <input
              id="menu-search"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search news, topics and more"
              className="min-h-12 flex-1 border border-ink bg-card px-3"
            />
            <button type="submit" className="inline-flex min-h-12 min-w-12 items-center justify-center bg-ink text-inverse-fg" aria-label="Search">
              <Search className="size-5" />
            </button>
          </form>
          <ul className="sheet mt-4 divide-y divide-line border-t border-line text-lg">
            <li>
              <Link to="/" className="block py-4" onClick={() => setOpen(false)}>
                Home
              </Link>
            </li>
            {NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="block py-4" onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
            {MORE.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="block py-4 text-base" onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-ink bg-card">
      <div className="sheet py-8">
        <Link to="/" className="font-serif text-2xl font-semibold">
          Ledgerline
        </Link>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
          <li>
            <Link to="/">Home</Link>
          </li>
          {NAV.map((item) => (
            <li key={item.to}>
              <Link to={item.to}>{item.label}</Link>
            </li>
          ))}
          {MORE.map((item) => (
            <li key={item.to}>
              <Link to={item.to}>{item.label}</Link>
            </li>
          ))}
          <li>
            <a href="/rss.xml">RSS</a>
          </li>
          <li>
            <Link to="/admin" className="text-muted">
              Staff
            </Link>
          </li>
        </ul>
        <p className="mt-6 max-w-3xl text-sm leading-6 text-muted">
          Ledgerline is an independent research publication. It is not a financial adviser, a broker, or a
          product-testing laboratory. Cryptocurrency coverage is information, not a recommendation to buy or
          sell. Affiliate links, when present, are marked.
        </p>
        <p className="mt-4 text-sm text-muted">© {new Date().getFullYear()} Ledgerline.</p>
      </div>
    </footer>
  );
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-card focus:px-3 focus:py-2">
        Skip to content
      </a>
      <SiteHeader />
      <div id="content">{children}</div>
      <SiteFooter />
    </div>
  );
}

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const result = await subscribe({ data: { email, consent, company } });
      setMessage(result.message);
      if (result.ok) setEmail("");
    } catch {
      setMessage("Could not save that address. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" id="desk-note">
      <label className="block text-sm font-semibold" htmlFor="desk-email">
        Email
      </label>
      <input
        id="desk-email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="min-h-12 w-full border border-line bg-card px-3"
      />
      <label className="flex items-start gap-2 text-sm leading-5">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-1 size-4"
        />
        <span>Send me the occasional desk note. I can unsubscribe later.</span>
      </label>
      <label className="absolute -left-[9999px]" aria-hidden="true">
        Company
        <input value={company} onChange={(event) => setCompany(event.target.value)} tabIndex={-1} autoComplete="off" />
      </label>
      <button type="submit" disabled={pending} className="min-h-11 bg-ink px-4 text-sm font-semibold text-inverse-fg disabled:opacity-60">
        {pending ? "Saving…" : "Subscribe"}
      </button>
      {message ? <p className="text-sm">{message}</p> : null}
    </form>
  );
}

export function NotFoundPage() {
  return (
    <PublicShell>
      <main className="sheet py-16">
        <p className="text-xs font-bold tracking-widest text-accent uppercase">404</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold">That page is not on the desk.</h1>
        <p className="mt-4 max-w-xl text-muted">The link may be old, or the article may still be a draft.</p>
        <Link to="/" className="mt-6 inline-flex min-h-11 items-center font-semibold text-accent">
          Back to the homepage
        </Link>
      </main>
    </PublicShell>
  );
}
