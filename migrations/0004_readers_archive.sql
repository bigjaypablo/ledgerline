do $$
declare r record;
begin
  for r in
    select conname from pg_constraint
    where conrelid = 'profiles'::regclass and contype = 'c'
  loop
    execute format('alter table profiles drop constraint %I', r.conname);
  end loop;
end $$;

alter table profiles add constraint profiles_role_check
  check (role in ('admin', 'editor', 'writer', 'reader'));

create table if not exists article_saves (
  user_id text not null,
  article_id text not null references articles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, article_id)
);

insert into articles (
  id, slug, title, summary, body, status, category_slug, author_id, label,
  seo_title, seo_description, cover_image, cover_alt, cover_caption,
  featured, deep_dive, last_checked, affiliate_disclosure, reading_minutes, published_at, updated_at
) values
(
  'art_erc20',
  'what-an-erc-20-page-actually-standardises',
  'What an ERC-20 page actually standardises',
  'Ethereum.org describes a token standard as a shared interface. A standard is not a promise about price, reserves, or who controls the issuer.',
  $ll$
Ledgerline did not deploy a token or trade one for this note. The useful question is what the standard page claims, and what it leaves alone.

## A shared shape, not a shared sponsor

Ethereum.org's token documentation describes ERC-20 as a standard for fungible tokens. A standard, in that sense, is a common way for contracts to expose functions so wallets and other contracts can talk to them. It is not a review of any particular issuer, and it is not a statement that two tokens with the same interface are the same economic thing.

## What to copy down before you treat a token as familiar

- The contract address you intend to use, taken from a source you already trust, not from a reply or a search ad.
- Whether the page you are reading is the standard, the issuer, or a third-party tracker.
- What the issuer itself says the token is redeemable for, if it says anything. The standard does not fill that sentence in.

If a tracker shows a price, that figure is a market print from that tracker at that time. It is not part of the ERC-20 text, and it is not evidence of reserves.
$ll$,
  'published', 'crypto', 'desk', 'Official documentation review',
  'What an ERC-20 page actually standardises',
  'A token standard is a shared interface. It is not a price, a reserve audit, or an endorsement.',
  '/covers/11-erc20.jpg',
  'A sheet of paper with an empty grid, a pen, and a thread.',
  'Editorial still life. Not a token contract and not a price chart.',
  false, false, '2026-10-25', false, 3, '2026-10-21 09:00:00+00', '2026-10-21 09:00:00+00'
),
(
  'art_context',
  'a-context-window-is-not-a-test-result',
  'A context window is not a test result',
  'A vendor number for how much text a model can take is a product limit. NIST''s risk framework is about evaluation. The two are not the same sentence.',
  $ll$
This is a reading note. Ledgerline did not benchmark a model, and it does not rank context lengths.

## The number is the vendor's limit

When a company publishes a context length, it is describing a limit of that product as the company states it. It does not, by itself, say how often the model follows instructions, what it refuses, or whether a long prompt was actually used in a task you care about.

## Evaluation is a different document

NIST describes its AI Risk Management Framework as voluntary guidance for trustworthiness in the design, development, use, and evaluation of AI. A context-window line on a pricing page is not that evaluation. If a vendor also cites an evaluation, open that document and write down who ran it and on what task.

Until you have done that, the honest label for the number is "vendor-stated limit."
$ll$,
  'published', 'ai', 'desk', 'Security and risk overview',
  'A context window is not a test result',
  'A vendor context length is a product limit, not an evaluation and not a ranking.',
  '/covers/12-context.jpg',
  'A long curl of blank paper with a short bookmark.',
  'Editorial still life. No model was run for this note.',
  false, true, '2026-10-25', false, 3, '2026-10-21 10:00:00+00', '2026-10-21 10:00:00+00'
),
(
  'art_renewal',
  'where-a-trial-ends-and-a-renewal-begins',
  'Where a trial ends and a renewal begins',
  'A trial date and a renewal date are often different lines. This note is about finding both before a card is charged. No product was subscribed to.',
  $ll$
Ledgerline did not start a trial for this piece. The method is to read the vendor's own pages, not to report a cancellation experience.

## Three lines that are easy to mix up

- The date the trial price ends.
- The date the paid term renews.
- The notice the vendor says it needs before a renewal.

Those can sit on a pricing page, a checkout screen, and a terms page. If only one of them is visible, write down which one is missing. A missing line is part of the record.

## What this note will not say

It will not say a named product is easy to cancel. A checkout screen is not a cancellation test. If you need the cancellation path, open the vendor's billing help and copy the steps they publish, including any exception for annual plans.
$ll$,
  'published', 'saas', 'desk', 'Practical guide',
  'Where a trial ends and a renewal begins',
  'How to separate a trial end date from a renewal date on a vendor''s own pages.',
  '/covers/13-renewal.jpg',
  'A sealed envelope beside a blank desk calendar.',
  'Editorial still life. No subscription was started.',
  false, false, '2026-10-25', false, 3, '2026-10-22 09:00:00+00', '2026-10-22 09:00:00+00'
),
(
  'art_whitepaper',
  'a-white-paper-is-not-a-filing',
  'A white paper is not a filing',
  'A project essay can describe a design. It is not, by itself, a regulator''s document or a promise that the design was built.',
  $ll$
Ledgerline is not treating any white paper as a disclosure that has been checked against code or against a regulator. This note is about the kind of document it is.

## An essay has an author

A white paper is a document a project publishes about itself. Quote it as the project's account. Do not upgrade a diagram into a claim that the system works as drawn, unless you are looking at something else: deployed code, an audit with a scope, or a regulator's own page.

## What to write in the margin

- Who published it, and the date on the file.
- Whether it says it is a technical design, a marketing piece, or both.
- The sentence it does not contain. Many papers do not say who can pause the system, change the rules, or hold the assets.

Bitcoin.org's custody warning is a useful contrast. It talks about keys and third parties in plain language. A white paper that never mentions custody is not a quieter version of that warning. It is a gap.
$ll$,
  'published', 'research', 'desk', 'Independent research',
  'A white paper is not a filing',
  'A project essay is not a regulator filing and not proof the design was built.',
  '/covers/14-paper.jpg',
  'A thick stack of unbound blank pages on a wooden desk.',
  'Editorial still life. Not a photograph of a project paper.',
  false, true, '2026-10-25', false, 3, '2026-10-22 11:00:00+00', '2026-10-22 11:00:00+00'
),
(
  'art_fees',
  'how-to-read-a-fee-schedule-that-leaves-blanks',
  'How to read a fee schedule that leaves blanks',
  'A fee table is only as complete as the rows it includes. This is a way to notice the missing rows. No account was opened.',
  $ll$
Ledgerline did not open an account or pay a fee for this guide. Prices move. The method is to list what the vendor's page states and what it skips.

## Rows that often sit somewhere else

A headline fee for a trade, a seat, or a token of usage is not the whole schedule. Look separately for:

- Spreads, network costs, or overage, if the product is the kind that has them.
- A different price for withdrawals, seats above a limit, or a region.
- A line that says a fee can change without a date.

If the page says "fees may change," copy that sentence next to the number. The number is then a figure as of the day you read it, which is why the last-checked line exists.

## Do not turn a blank into a zero

A row the page does not show is not a free row. Record it as "not stated on this page." That is a narrower claim, and it is the one the page supports.
$ll$,
  'published', 'guides', 'desk', 'Pricing analysis',
  'How to read a fee schedule that leaves blanks',
  'A method for noticing fee rows a vendor page does not state. Not a price survey.',
  '/covers/15-fees.jpg',
  'A curling receipt on dark stone, with the figures out of focus.',
  'Editorial still life. No fee was paid and no price is shown.',
  false, false, '2026-10-25', false, 3, '2026-10-23 09:00:00+00', '2026-10-23 09:00:00+00'
),
(
  'art_status',
  'a-status-page-is-the-company-talking-about-itself',
  'A status page is the company talking about itself',
  'An uptime banner is a statement by the operator. It is not an independent measurement, and a green lamp is not a custody review.',
  $ll$
Ledgerline did not monitor a venue and does not reprint an uptime percentage here. The point is how to read the page you are shown.

## Whose sentence is it

A status page is published by the company that runs the service, or by a status vendor the company chose. If it says a system is operational, that is the company's account at that time. It is not a measurement Ledgerline made.

## What it does not settle

It does not settle who holds keys. Bitcoin.org's wallet guidance still applies beside any status lamp: if a third party controls the keys, you are relying on that party's security and honesty. A status page does not answer that. It also does not say what happens to withdrawals during a stated incident unless the incident note itself says so.

Write down the time you looked, because status pages change, and a later visit is a different document.
$ll$,
  'published', 'crypto', 'desk', 'Security and risk overview',
  'A status page is the company talking about itself',
  'An uptime banner is the operator''s account, not an independent measurement.',
  '/covers/16-status.jpg',
  'A dark panel with a single warm lamp lit.',
  'Editorial still life. Not a screenshot of a status page.',
  false, false, '2026-10-25', false, 3, '2026-10-23 12:00:00+00', '2026-10-23 12:00:00+00'
)
on conflict (id) do nothing;

insert into article_sources (id, article_id, title, publisher, url, source_type, published_on, accessed_on, claim, sort_order) values
(
  'art_erc20_s0', 'art_erc20', 'ERC-20 token standard', 'ethereum.org',
  'https://ethereum.org/en/developers/docs/standards/tokens/erc-20/',
  'Primary documentation', null, '2026-10-25',
  'Ethereum.org documents ERC-20 as a standard for fungible tokens, which is an interface description rather than an issuer review or a price.',
  0
),
(
  'art_context_s0', 'art_context', 'AI Risk Management Framework', 'NIST Information Technology Laboratory',
  'https://www.nist.gov/itl/ai-risk-management-framework',
  'Primary standards body', null, '2026-10-25',
  'NIST describes the AI Risk Management Framework as voluntary guidance for trustworthiness in design, development, use, and evaluation. A vendor context length is not that evaluation.',
  0
),
(
  'art_renewal_s0', 'art_renewal', 'Editorial standards', 'Ledgerline',
  '/standards',
  'Editorial standard', '2026-10-20', '2026-10-25',
  'Ledgerline''s standard is that a checkout screen is not a cancellation test. This note stays inside that limit.',
  0
),
(
  'art_whitepaper_s0', 'art_whitepaper', 'Securing your wallet', 'Bitcoin.org',
  'https://bitcoin.org/en/secure-your-wallet',
  'Primary documentation', null, '2026-10-25',
  'Bitcoin.org says that when a third party controls the keys, you rely on that party''s security and honesty. A project essay that never discusses custody does not replace that warning.',
  0
),
(
  'art_fees_s0', 'art_fees', 'Editorial standards', 'Ledgerline',
  '/standards',
  'Editorial standard', '2026-10-20', '2026-10-25',
  'Ledgerline does not treat a missing row as a zero, and it does not present a pricing-page summary as a test.',
  0
),
(
  'art_status_s0', 'art_status', 'Securing your wallet', 'Bitcoin.org',
  'https://bitcoin.org/en/secure-your-wallet',
  'Primary documentation', null, '2026-10-25',
  'Bitcoin.org describes third-party key control as reliance on that party. A status page does not answer who holds keys.',
  0
)
on conflict (id) do nothing;
