import { useState } from "react";
import { PublicShell } from "@/components/editorial/shell";
import { submitContact } from "@/lib/editorial/public";
import type { Settings } from "@/lib/editorial/types";

const pages = {
  about: {
    title: "About Ledgerline",
    body: [
      "Ledgerline is an independent research publication about cryptocurrency: exchanges, wallets, custody, and the primary documents behind them.",
      "The desk explains what a product says it does, what it says it costs, what the documents leave out, and what a reader should check before paying or connecting an account.",
      "Ledgerline is not a registered broker, exchange, law firm, or laboratory. No company registration number or street address is published here, because none is claimed. The founder edits the desk.",
      "Articles are labeled. A practical guide, a pricing analysis, or a feature comparison is not a hands-on test. The desk does not write “we tested this” unless a named person actually did.",
    ],
  },
  standards: {
    title: "Editorial standards",
    body: [
      "Ledgerline prefers primary documents: official product documentation, official pricing and terms, security audits, regulator or court records, protocol documentation, and established data sources with an as-of date.",
      "Company language is attributed to the company. It is not repeated as Ledgerline’s own finding. Market prices are not treated as proof of safety or of reserves.",
      "Every published research article needs a source list and a last-checked date. If either is missing, the page says so.",
      "Competitor affiliate blogs are not used as primary evidence. Affiliate links, when they exist, come from records an admin has marked approved, and they are disclosed.",
      "AI-assisted drafts are not published by themselves. A person with editor access has to publish.",
      "This page is a working standard for the desk, not a claim of outside accreditation.",
    ],
  },
  corrections: {
    title: "Corrections",
    body: [
      "If a date, a quote, a price, or a description is wrong, send a correction through the contact form. Name the article, the sentence, and a primary source for the correction.",
      "Material corrections should be noted on the article, with the updated date changed. The desk does not silently rewrite a factual error and pretend the first version never existed.",
      "This policy is a draft for the editor to follow. It is not a legal judgment about defamation or jurisdiction.",
    ],
  },
  disclosure: {
    title: "Affiliate disclosure",
    body: [
      "Some links on Ledgerline are affiliate links. If you sign up or buy through one, Ledgerline may earn a commission.",
      "Affiliate links are labelled on the page.",
      "A commission does not change what Ledgerline covers or what an article says. An affiliate link is not an endorsement and not a hands-on test.",
      "Where a program publishes its commission terms, Ledgerline may show them. Where it does not, they are marked as not documented. The desk does not guess rates, cookie lengths, or recurring commissions.",
      "Some airdrop and project listings may be marked Sponsored. Sponsored means the project paid for placement. It does not change the checks applied to the listing.",
      "Rules about promoting and buying crypto differ by country, and some platforms are not available everywhere. Check what applies where you live before you sign up.",
      "If no affiliate program is active, articles show no affiliate buttons. The research stands without them.",
    ],
  },
  privacy: {
    title: "Privacy",
    body: [
      "This is a starting draft, not a lawyer-approved privacy policy.",
      "If you subscribe, Ledgerline stores your email address, your consent, and an unsubscribe token. The list is visible to admins. It is not shown on the public site.",
      "If you send a contact message, Ledgerline stores your name, email, and message for the editor.",
      "If you comment, Ledgerline stores the name you type and the comment. It stays hidden until an editor approves it.",
      "Affiliate click counts store that a button was used. They are not tied to your name.",
      "Desk sign-in is handled by the site’s account system (Google or X). Those providers receive the sign-in you start. Ledgerline stores a profile: name, role, optional biography, and optional X link.",
      "This version of the publication does not sell personal information and does not run a third-party advertising network. A mail provider is not connected unless an admin marks newsletter sending as configured, and even then this build does not send mail by itself.",
      "You can unsubscribe with the token in a future letter, or ask the editor to remove an address through the contact form.",
    ],
  },
  terms: {
    title: "Terms of use",
    body: [
      "This is a starting draft for review. It is not legal advice and it has not been signed off by a lawyer.",
      "The articles are for information. They are not an offer to sell securities, tokens, or software, and they are not financial, legal, or tax advice.",
      "You are responsible for checking primary sources before you pay, deposit, or connect an account. Pages go out of date. The last-checked line is there for that reason.",
      "Do not copy the articles wholesale and present them as your own research. Linking and short quotation with credit is welcome.",
      "Do not use the comment form or contact form to abuse, threaten, or advertise. The desk can reject or delete comments.",
      "The site is provided as available. Ledgerline does not promise uninterrupted access or that every description will stay current after its last-checked date.",
    ],
  },
  disclaimer: {
    title: "Research disclaimer",
    body: [
      "Ledgerline publishes independent research, explainers, comparisons, documentation review, security overviews, and practical guides about cryptocurrency.",
      "Unless an article explicitly says a named person tested a product, the desk did not test it. Do not read a guide as a laboratory result.",
      "Cryptocurrency coverage is general information. It is not financial, investment, legal, or tax advice, and not a solicitation to buy, sell, or hold any asset, token, or account.",
      "Issuer and platform pages are claims by those companies. Ledgerline attributes them. It does not audit reserves or uptime unless an article says that work was done and shows the source.",
      "Examples, calculations, and yields in articles are illustrations with a stated date and source. Rates, fees, and terms change, and past results do not predict future results. You can lose some or all of the money you put into crypto.",
      "Rules differ by country, and many platforms are not available everywhere. Check what applies where you live, including tax, before you act.",
      "Some pages contain affiliate links, which are marked. Ledgerline may earn a commission if you use them. This does not change how an article is researched and is not a recommendation to use any product.",
      "Nothing on this site creates a client, advisory, or fiduciary relationship.",
    ],
  },
} as const;

export type LegalKey = keyof typeof pages;

export function LegalView({ page, settings }: { page: LegalKey; settings?: Settings }) {
  const entry = pages[page];
  return (
    <PublicShell>
      <main className="sheet max-w-3xl py-8">
        <p className="text-xs font-bold tracking-widest text-accent uppercase">Ledgerline</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold">{entry.title}</h1>
        <p className="mt-3 text-sm text-muted">Draft for the editor to review. Not a claim of legal approval.</p>
        <div className="mt-6 space-y-4 text-lg leading-8">
          {entry.body.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
        {page === "about" && settings?.contactEmail ? (
          <p className="mt-6 text-base">
            Contact: <a className="text-accent" href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
          </p>
        ) : null}
      </main>
    </PublicShell>
  );
}

export function ContactView({ settings }: { settings: Settings }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [note, setNote] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const result = await submitContact({ data: { name, email, message, company } });
    setNote(result.message);
    if (result.ok) {
      setMessage("");
      setName("");
      setEmail("");
    }
  }

  return (
    <PublicShell>
      <main className="sheet max-w-3xl py-8">
        <h1 className="font-serif text-4xl font-semibold">Contact</h1>
        <p className="mt-3 text-lg leading-8">
          Ledgerline does not publish a street address. Messages from this form are stored for the editor. The
          form itself does not send email.
        </p>
        {settings.contactEmail ? (
          <p className="mt-3 text-base">
            Or write to <a className="text-accent" href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>.
          </p>
        ) : (
          <p className="mt-3 text-sm text-muted">No public email is configured yet. Use the form.</p>
        )}
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <label className="block text-sm font-semibold" htmlFor="contact-name">Name</label>
          <input id="contact-name" value={name} onChange={(event) => setName(event.target.value)} required className="min-h-12 w-full border border-line bg-card px-3" />
          <label className="block text-sm font-semibold" htmlFor="contact-email">Email</label>
          <input id="contact-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="min-h-12 w-full border border-line bg-card px-3" />
          <label className="block text-sm font-semibold" htmlFor="contact-message">Message</label>
          <textarea id="contact-message" value={message} onChange={(event) => setMessage(event.target.value)} required className="min-h-36 w-full border border-line bg-card px-3 py-2" />
          <label className="absolute -left-[9999px]" aria-hidden="true">
            Company
            <input value={company} onChange={(event) => setCompany(event.target.value)} tabIndex={-1} autoComplete="off" />
          </label>
          <button type="submit" className="min-h-11 bg-ink px-4 text-sm font-semibold text-inverse-fg">Send</button>
          {note ? <p className="text-sm">{note}</p> : null}
        </form>
      </main>
    </PublicShell>
  );
}
