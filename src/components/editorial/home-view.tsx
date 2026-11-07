import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Cover } from "@/components/editorial/cards";
import { TopicGrid } from "@/components/editorial/topic-grid";
import { FeatureCard, LatestList } from "@/components/editorial/rows";
import { ThumbSlider } from "@/components/editorial/thumb-slider";
import { PublicShell } from "@/components/editorial/shell";
import { NewsletterBand } from "@/components/editorial/newsletter-band";
import { LeadSlideshow } from "@/components/editorial/slideshow";
import { MarketWidgets } from "@/components/editorial/market-widgets";
import { trackAffiliateClick } from "@/lib/editorial/public";
import type { Card, HomeData } from "@/lib/editorial/types";

function slideCards(data: HomeData): Card[] {
  const seen = new Set<string>();
  const cards: Card[] = [];
  for (const card of [data.lead, ...data.secondary.slice(0, 3), ...data.picks, ...data.latest, ...data.crypto]) {
    if (!card || seen.has(card.id)) continue;
    seen.add(card.id);
    cards.push(card);
    if (cards.length === 8) break;
  }
  return cards;
}

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
  const shown = new Set<string>([lead?.id ?? "", ...data.secondary.slice(0, 3).map((c) => c.id)]);
  const latest = data.latest.filter((c) => !shown.has(c.id));
  return (
    <PublicShell>
      <StandardsNote />
      <main>
        {lead ? (
          <>
            <LeadSlideshow cards={slideCards(data)} />
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

        <MarketWidgets />

        {latest.length > 0 ? (
          <section className="sheet border-t border-ink py-8">
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <FeatureCard card={latest[0]} />
              </div>
              <div className="lg:col-span-5">
                <LatestList cards={data.latest.filter((c) => c.id !== latest[0].id).slice(0, 6)} />
              </div>
            </div>
          </section>
        ) : null}

        {data.secondary.length > 0 ? (
          <ThumbSlider cards={data.secondary.filter((c) => !latest.some((l) => l.id === c.id))} />
        ) : null}

        <TopicGrid data={data} />

        {data.picks.length > 0 ? (
          <section className="bg-ink text-inverse-fg">
            <div className="sheet py-8">
              <h2 className="text-sm font-bold tracking-widest uppercase">Editor's picks</h2>
              <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                {data.picks.map((card) => (
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
      </main>
      <NewsletterBand xUrl={data.settings.xUrl} />
    </PublicShell>
  );
}
