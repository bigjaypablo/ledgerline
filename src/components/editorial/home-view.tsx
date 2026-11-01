import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Cover, SectionBand, StoryCard } from "@/components/editorial/cards";
import { FeatureCard, LatestList } from "@/components/editorial/rows";
import { ThumbSlider } from "@/components/editorial/thumb-slider";
import { NewsletterForm, PublicShell } from "@/components/editorial/shell";
import { LeadSlideshow } from "@/components/editorial/slideshow";
import { trackAffiliateClick } from "@/lib/editorial/public";
import type { Card, HomeData } from "@/lib/editorial/types";


const NOTE_KEY = "ledgerline:standards-dismissed";

function StandardsNote() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    try {
      if (window.localStorage.getItem(NOTE_KEY)) setHidden(true);
    } catch {
      /* storage blocked: keep it visible */
    }
  }, []);
  if (hidden) return null;
  return (
    <div className="border-b border-line bg-card">
      <div className="sheet relative flex flex-col gap-4 py-6 pr-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-serif text-3xl font-semibold leading-tight">Research before you pay.</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            Ledgerline reads pricing pages, terms, and primary sources. It is not a product lab and it is not
            financial advice.
          </p>
        </div>
        <Link to="/standards" className="inline-flex min-h-11 items-center justify-center bg-ink px-4 text-sm font-semibold text-inverse-fg">
          Editorial standards
        </Link>
        <button
          type="button"
          aria-label="Dismiss this note"
          title="Dismiss"
          className="absolute right-0 top-3 inline-flex h-9 w-9 items-center justify-center text-lg leading-none text-muted hover:text-ink"
          onClick={() => {
            try {
              window.localStorage.setItem(NOTE_KEY, "1");
            } catch {
              /* ignore */
            }
            setHidden(true);
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export function HomeView({ data }: { data: HomeData }) {
  const { lead } = data;
  const used = new Set<string>();
  const take = (cards: Card[], max = Infinity): Card[] => {
    const out: Card[] = [];
    for (const c of cards) {
      if (out.length >= max) break;
      if (used.has(c.id)) continue;
      used.add(c.id);
      out.push(c);
    }
    return out;
  };
  const byId = new Map<string, Card>();
  for (const c of [lead, ...data.secondary, ...data.latest, ...data.crypto, ...data.ai, ...data.saas, ...data.guides, ...data.picks]) {
    if (c) byId.set(c.id, c);
  }
  const newest = [...byId.values()].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const hero = take([lead, ...data.picks].filter((c): c is Card => !!c), 5);
  if (hero.length < 3) hero.push(...take(newest, 3 - hero.length));
  const latest = take(newest, 6);
  const more = take(data.secondary, 8);
  const crypto = take(data.crypto, 4);
  const ai = take(data.ai, 4);
  const saas = take(data.saas, 4);
  const guidesAll = take(data.guides, 9);
  const guides = guidesAll.length >= 3 ? guidesAll.slice(0, guidesAll.length - (guidesAll.length % 3)) : guidesAll;
  const picks = take(data.picks);
  
  return (
    <PublicShell>
      <StandardsNote />
      <main>
        {lead ? (
          <>
            <LeadSlideshow cards={hero} />
          </>
        ) : (
          <section className="sheet py-12">
            <p className="text-xs font-bold tracking-widest text-accent uppercase">The desk is open</p>
            <h1 className="mt-2 max-w-3xl font-serif text-4xl font-semibold sm:text-5xl">
              Nothing has been published yet.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-7 text-muted">
              When an editor publishes a sourced article, it will appear here. Drafts stay off this page.
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {data.categories.slice(0, 3).map((category) => (
                <article key={category.slug} className="border-t border-ink pt-3">
                  <h2 className="font-serif text-2xl font-semibold">{category.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted">{category.description}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {latest.length > 0 ? (
          <section className="sheet border-t border-ink py-8">
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <FeatureCard card={latest[0]} />
              </div>
              <div className="lg:col-span-5">
                <LatestList cards={latest.slice(1)} />
              </div>
            </div>
          </section>
        ) : null}

        {more.length > 0 ? (
          <ThumbSlider cards={more} />
        ) : null}

        <SectionBand title="Crypto" href="/crypto" articles={crypto} />
        <SectionBand title="AI" href="/ai" articles={ai} />
        <SectionBand title="SaaS" href="/saas" articles={saas} />

        {guides.length > 0 ? (
          <section className="sheet border-t border-ink py-8">
            <div className="mb-4 flex items-end justify-between border-b border-ink pb-2">
              <h2 className="text-sm font-bold tracking-widest uppercase">Guides and comparisons</h2>
              <Link to="/guides" className="text-sm font-semibold text-accent">
                More
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {guides.map((card) => (
                <StoryCard key={card.id} card={card} />
              ))}
            </div>
          </section>
        ) : null}

        {picks.length > 0 ? (
          <section className="bg-ink text-inverse-fg">
            <div className="sheet py-8">
              <h2 className="text-sm font-bold tracking-widest uppercase">Editor's picks</h2>
              <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                {picks.map((card) => (
                  <article key={card.id}>
                    <Cover card={card} />
                    <p className="mt-3 text-xs font-bold tracking-widest text-accent uppercase">{card.label}</p>
                    <h3 className="mt-1 font-serif text-xl font-semibold leading-snug">
                      <Link to="/article/$slug" params={{ slug: card.slug }}>
                        {card.title}
                      </Link>
                    </h3>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {data.tools.length > 0 ? (
          <section className="sheet py-8">
            <h2 className="border-b border-ink pb-2 text-sm font-bold tracking-widest uppercase">Featured tools</h2>
            <p className="mt-3 text-sm text-muted">
              These are approved affiliate links. A paid relationship is not a test and not an endorsement.
            </p>
            <ul className="mt-4 grid gap-4 md:grid-cols-3">
              {data.tools.map((tool) => (
                <li key={tool.id} className="border border-line bg-card p-4">
                  <p className="text-xs font-bold tracking-widest text-accent uppercase">{tool.category || "Tool"}</p>
                  <h3 className="mt-1 font-serif text-2xl font-semibold">{tool.name}</h3>
                  {tool.commissionNotes ? <p className="mt-2 text-sm text-muted">{tool.commissionNotes}</p> : null}
                  <a
                    href={tool.affiliateUrl}
                    rel="sponsored nofollow noopener"
                    target="_blank"
                    className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-accent"
                    onClick={() => void trackAffiliateClick({ data: { id: tool.id } })}
                  >
                    Provider site · Affiliate
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="border-t border-line bg-card">
          <div className="sheet grid gap-8 py-10 md:grid-cols-2">
            <div>
              <h2 className="font-serif text-3xl font-semibold">The desk note</h2>
              <p className="mt-3 text-base leading-7 text-muted">
                Occasional research, not a product blast. Addresses are stored here.
                {data.settings.newsletterConfigured
                  ? " A mail provider is marked as connected."
                  : " A confirmation email is not sent until a mail provider is connected."}
              </p>
              {data.settings.xUrl ? (
                <p className="mt-4 text-sm">
                  <a href={data.settings.xUrl} className="font-semibold text-accent" rel="noopener noreferrer">
                    Follow Ledgerline on X
                  </a>
                </p>
              ) : null}
            </div>
            <NewsletterForm />
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
