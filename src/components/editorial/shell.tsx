import { PageTracker } from "@/components/editorial/page-tracker";
import { ThemeToggle } from "@/components/editorial/theme-toggle";
import { PublicAccountMenu } from "@/components/editorial/public-account-menu";
import { CookieBanner } from "@/components/editorial/cookie-banner";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { subscribe } from "@/lib/editorial/public";
import { PriceTicker } from "@/components/editorial/ticker";

export const NAV = [
  { to: "/crypto", label: "Crypto" },
  { to: "/opportunities", label: "Opportunities" },
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
  if (user) return <PublicAccountMenu />;
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
    <header className="contents">
      <div className="sticky top-0 z-40 border-b border-line bg-card">
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
          <span className="block font-logo text-2xl font-semibold leading-none tracking-tight sm:text-3xl">
            Ledgerline
          </span>
          <span className="mt-1 block h-0.5 bg-accent" />
        </Link>
        <AccountLink className="inline-flex min-h-11 items-center bg-ink px-3 text-sm font-semibold text-inverse-fg" />
      </div>
      </div>
      <nav className="hidden border-b border-line bg-card md:block" aria-label="Sections">
        <ul className="sheet flex justify-center gap-6 py-2 text-sm font-semibold">
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
            <span className="font-logo text-2xl font-semibold">Ledgerline</span>
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
          <nav className="sheet mt-6 space-y-6 text-base pb-12">
            <div>
              <p className="text-xs font-bold tracking-widest text-accent uppercase">Coverage</p>
              <div className="mt-2 grid gap-1 font-semibold text-lg">
                <Link to="/crypto" className="block py-2 hover:text-accent" onClick={() => setOpen(false)}>Crypto</Link>
                <Link to="/ai" className="block py-2 hover:text-accent" onClick={() => setOpen(false)}>AI</Link>
                <Link to="/saas" className="block py-2 hover:text-accent" onClick={() => setOpen(false)}>SaaS</Link>
              </div>
            </div>

            <div className="border-t border-line pt-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold tracking-widest text-accent uppercase">Opportunities</p>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-accent/10 text-accent px-1.5 py-0.5 rounded">Tracker</span>
              </div>
              <div className="mt-2 grid gap-1">
                <Link to="/opportunities" className="block py-2 font-semibold text-lg hover:text-accent" onClick={() => setOpen(false)}>
                  All Opportunities
                </Link>
                <div className="pl-3 border-l border-line grid gap-1 text-sm text-muted">
                  <Link to="/opportunities" search={{ kind: "testnet" }} className="py-1 hover:text-ink" onClick={() => setOpen(false)}>Testnets (Zero Capital)</Link>
                  <Link to="/opportunities" search={{ kind: "points" }} className="py-1 hover:text-ink" onClick={() => setOpen(false)}>Points Programs</Link>
                  <Link to="/opportunities" search={{ rewardStatus: "confirmed" }} className="py-1 hover:text-ink" onClick={() => setOpen(false)}>Confirmed Airdrops</Link>
                </div>
              </div>
            </div>

            <div className="border-t border-line pt-4">
              <p className="text-xs font-bold tracking-widest text-accent uppercase">Library</p>
              <div className="mt-2 grid gap-1 font-semibold text-lg">
                <Link to="/guides" className="block py-2 hover:text-accent" onClick={() => setOpen(false)}>Guides</Link>
                <Link to="/comparisons" className="block py-2 hover:text-accent" onClick={() => setOpen(false)}>Reviews</Link>
                <Link to="/research" className="block py-2 hover:text-accent" onClick={() => setOpen(false)}>Research</Link>
                <Link to="/archive" className="block py-2 hover:text-accent" onClick={() => setOpen(false)}>Archive</Link>
              </div>
            </div>

            <details className="group border-t border-line pt-4 text-sm text-muted">
              <summary className="cursor-pointer py-2 font-semibold text-ink list-none flex justify-between items-center text-base">
                <span>About & Disclosures</span>
                <span className="text-xs transition-transform group-open:rotate-180">▼</span>
              </summary>
              <div className="mt-2 grid gap-2 pl-3 border-l border-line text-xs">
                <Link to="/about" className="py-1 hover:text-ink" onClick={() => setOpen(false)}>About Ledgerline</Link>
                <Link to="/standards" className="py-1 hover:text-ink" onClick={() => setOpen(false)}>Editorial Standards</Link>
                <Link to="/corrections" className="py-1 hover:text-ink" onClick={() => setOpen(false)}>Corrections</Link>
                <Link to="/disclosure" className="py-1 hover:text-ink" onClick={() => setOpen(false)}>Affiliate Disclosure</Link>
                <Link to="/disclaimer" className="py-1 hover:text-ink" onClick={() => setOpen(false)}>Research Disclaimer</Link>
                <Link to="/contact" className="py-1 hover:text-ink" onClick={() => setOpen(false)}>Contact</Link>
                <Link to="/privacy" className="py-1 hover:text-ink" onClick={() => setOpen(false)}>Privacy Policy</Link>
                <Link to="/terms" className="py-1 hover:text-ink" onClick={() => setOpen(false)}>Terms of Service</Link>
              </div>
            </details>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

const ABOUT = MORE.filter((i) => ["/about", "/standards", "/corrections", "/contact"].includes(i.to));
const LEGAL = MORE.filter((i) => ["/disclosure", "/disclaimer", "/privacy", "/terms"].includes(i.to));
const fl = "inline-flex min-h-11 items-center hover:text-accent";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-card font-sans">
      <div className="sheet pt-10 pb-28 md:pb-10">
        <Link to="/" className="font-logo text-2xl font-semibold">
          Ledgerline
        </Link>
        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8 text-sm text-muted sm:grid-cols-3">
          <nav aria-label="Sections">
            <h2 className="text-xs font-bold tracking-widest text-ink uppercase">Sections</h2>
            <ul className="mt-2">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={fl}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="About">
            <h2 className="text-xs font-bold tracking-widest text-ink uppercase">About</h2>
            <ul className="mt-2">
              {ABOUT.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={fl}>{item.label}</Link>
                </li>
              ))}
              <li><a href="/rss.xml" className={fl}>RSS</a></li>
            </ul>
          </nav>
          <nav aria-label="Legal" className="col-span-2 sm:col-span-1">
            <h2 className="text-xs font-bold tracking-widest text-ink uppercase">Legal</h2>
            <ul className="mt-2">
              {LEGAL.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={fl}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-8 max-w-3xl border-t border-line pt-6 text-xs leading-5 text-muted">
          Ledgerline is an independent research publication. It is not a financial adviser, a broker, or a
          product-testing laboratory. Cryptocurrency coverage is information, not a recommendation to buy or
          sell. Affiliate links, when present, are marked.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-muted">
          <p>
            © {new Date().getFullYear()} Ledgerline. Created and owned by Big Jay.{" "}
            <a href="https://x.com/0xNormadOnChain" target="_blank" rel="noopener noreferrer me" className="underline hover:text-accent">
              Follow on X
            </a>
          </p>
          <ThemeToggle />
        </div>
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
      <CookieBanner />
      <PageTracker />
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
