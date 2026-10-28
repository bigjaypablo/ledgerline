import { writeFileSync } from "node:fs";

const articles = [
  {
    id: "art_exchange",
    slug: "before-you-fund-a-crypto-exchange",
    title: "What to verify before you send money to a crypto exchange",
    summary:
      "A checklist for reading an exchange's own terms before you deposit. Ledgerline did not open accounts or move funds for this guide.",
    category: "crypto",
    label: "Practical guide",
    cover: "/covers/01-exchange.svg",
    alt: "Editorial plate numbered 01 on a dark ground, labeled Crypto.",
    caption: "Section plate. Not a photograph of an exchange, a wallet, or a product test.",
    featured: true,
    deep: true,
    published: "2026-10-20 09:00:00+00",
    tags: ["custody", "exchanges"],
    sources: [
      {
        title: "Securing your wallet",
        publisher: "Bitcoin.org",
        url: "https://bitcoin.org/en/secure-your-wallet",
        type: "Primary documentation",
        published: "",
        claim:
          "Bitcoin.org says protecting bitcoin is the holder's responsibility, and that a third party who controls the keys is a party you are trusting for security and honesty. It also describes backups and keeping spending amounts separate from savings.",
      },
    ],
    body: `Ledgerline did not open an exchange account, deposit funds, or rank any company for this guide. There is no score and no "best exchange" list. The useful question is narrower: what can you verify from primary pages before money leaves your control?

## Who holds the keys

Bitcoin.org's wallet guidance is direct about custody. It tells readers that protecting their money is their own responsibility. It also says that when a third party controls the keys, you rely on that party's security and honesty, and that exchanges and online wallets have been hacked, have failed, or have frozen access to funds.

That is a description of a structural risk. It is not a prediction about any one company, and it is not a claim that every customer of every venue will lose money. If a company holds the keys, you are accepting that class of risk for the amount you leave there.

The same page suggests a practical split: keep only small amounts in convenient places, and keep savings somewhere safer, including offline storage where that fits the threat you actually face. A smaller hot balance does not make the deposit safe. It limits how much sits in the convenient place.

## What to read on the company's own site

Before depositing, open the company's current pages and write the answers down. Do not rely on a review blog's summary.

- Which legal entity is named, and where does the page say it operates?
- Does the page say the company can delay, freeze, or reverse withdrawals, and under what stated conditions?
- What identity checks does it describe before a withdrawal, not only before a deposit?
- Is there a published proof-of-reserves, audit, or attestation, and what does that document say it does not cover?
- What does the company's own incident history or status page show, as distinct from a marketing uptime line?

If a page does not answer one of those questions, record the gap. A missing answer is information.

## What this guide does not show

It does not show which venue has the lowest fee today, which one will remain solvent, or whether a listed token has any particular value. Fees, licensing, and withdrawal rules change. Recheck the primary pages on the date you act. A market price is not evidence of safety.

Encrypting a device you control, and keeping a backup of a wallet you control, are ordinary steps Bitcoin.org also describes. Neither step makes an exchange deposit safe. They reduce a different loss: the loss of a machine that was yours.`,
  },
  {
    id: "art_pricing",
    slug: "how-to-read-an-ai-pricing-page",
    title: "How to read an AI tool's pricing page before you subscribe",
    summary:
      "A method for copying the unit, the meter, and the overage rule before comparing tools. This guide does not quote a live price.",
    category: "ai",
    label: "Pricing analysis",
    cover: "/covers/02-pricing.svg",
    alt: "Editorial plate numbered 02 on warm paper, labeled AI.",
    caption: "Section plate. Ledgerline did not meter any model or reprint a vendor price.",
    featured: false,
    deep: true,
    published: "2026-10-19 16:00:00+00",
    tags: ["pricing", "ai"],
    sources: [
      {
        title: "AI Risk Management Framework",
        publisher: "NIST Information Technology Laboratory",
        url: "https://www.nist.gov/itl/ai-risk-management-framework",
        type: "Primary standards body",
        published: "2023-01-26",
        claim:
          "NIST describes the AI Risk Management Framework as voluntary guidance for trustworthiness in the design, development, use, and evaluation of AI products. It is not a price list, a product ranking, or a certification of a named tool.",
      },
    ],
    body: `An AI company's pricing page is a primary source for what that company says it charges. It is not a measurement of what you will pay, and it is not a safety review. Ledgerline does not copy vendor prices into this guide. A copied number goes stale, and a stale number is worse than a link you open yourself.

## A framework is not a bill

NIST's AI Risk Management Framework, released on 26 January 2023, is voluntary guidance for incorporating trustworthiness into how AI products are designed, built, used, and evaluated. It is not mandatory, and it is not a catalog of subscription prices. Citing it here does not mean a vendor has adopted it. It marks the difference between a public risk framework and a checkout page.

## The fields that change the bill

When you open a pricing page, copy these items into a note before you compare anything:

- The unit being sold: a seat, a token, a credit, a run, or a month.
- Whether the quoted figure is monthly, yearly, or a prepaid balance.
- What happens when the included amount runs out: a hard stop, an overage, or a change of plan.
- Which features the cheap plan excludes, especially export, retention, and commercial use.
- Whether the price is for an API, a chat product, or both.
- The date printed on the page, or the date you captured it if the page has none.

Rate limits, context windows, and data-retention defaults are part of the price even when they sit on a different URL. If the documentation and the pricing page disagree, treat the disagreement as unresolved until the company clarifies it.

## What not to conclude

A lower advertised price is not evidence of a better model, a safer data policy, or a stable bill. This article does not rank tools and does not report a hands-on test. NIST's framework does not fill that gap. It tells you that evaluation is a separate task from buying.`,
  },
  {
    id: "art_trial",
    slug: "what-a-saas-trial-commits-you-to",
    title: "The clauses that decide whether a SaaS trial stays free",
    summary:
      "What to read on the pricing page, the checkout, and the renewal terms before you enter a card. No product was subscribed to for this piece.",
    category: "saas",
    label: "Practical guide",
    cover: "/covers/03-trial.svg",
    alt: "Editorial plate numbered 03 on burgundy, labeled SaaS.",
    caption: "Section plate. No subscription was started for this guide.",
    featured: false,
    deep: false,
    published: "2026-10-19 11:00:00+00",
    tags: ["saas", "pricing"],
    sources: [
      {
        title: "Editorial standards",
        publisher: "Ledgerline",
        url: "https://example.com/standards",
        type: "Editorial standard",
        published: "2026-10-20",
        claim:
          "Ledgerline's own standard is that a checkout screen is not a hands-on cancellation test. This guide follows that limit and does not claim a named product is easy or hard to cancel.",
      },
    ],
    body: `A free trial is a contract preview, not a gift, until the terms in front of you say otherwise. Ledgerline did not start a trial, enter a card, or time a cancellation for this article. No company is named as easy or hard to leave, because that would be a test result this desk does not have.

## Three pages, not one slogan

Read the pricing page, the checkout screen, and the clause that mentions renewal. Write the date beside the answers.

- Does the checkout say the plan will renew, and on what date?
- Is a card required to start, and does the page say when the first charge happens?
- Is cancellation described as a button, an email, or a notice period?
- What does the company say happens to exports and stored files if you cancel?
- Are seats, usage, or add-ons billed separately from the price you first saw?
- Does an annual discount lock a term, and does the page describe a fee for leaving early?

If the marketing page and the checkout disagree, the checkout is the screen you are about to accept. The conflict is unresolved. Do not treat it as a discount.

## Why this article cites the desk, not a statute

Cancellation rules differ by country, and this guide is not a legal memo. Ledgerline's editorial standards require the desk to separate a company's own language from a test the desk did not run. That is the claim the source on this page supports. It does not tell you that any particular vendor complies with any particular law.

Recheck the pages on the day you subscribe. A clause quoted from memory is not the clause on the screen.`,
  },
  {
    id: "art_stable",
    slug: "stablecoin-labels-are-not-interchangeable",
    title: "Stablecoin labels are not interchangeable",
    summary:
      "USDC and USDT carry different issuer language. This is a comparison of public descriptions, not a reserve audit and not a price forecast.",
    category: "crypto",
    label: "Feature comparison",
    cover: "/covers/04-stable.svg",
    alt: "Editorial plate numbered 04 on warm paper, labeled Crypto.",
    caption: "Section plate. Not a photograph of coins and not a reserve audit.",
    featured: false,
    deep: true,
    published: "2026-10-18 15:00:00+00",
    tags: ["stablecoins"],
    sources: [
      {
        title: "USDC",
        publisher: "Circle",
        url: "https://www.circle.com/usdc",
        type: "Issuer disclosure",
        published: "",
        claim:
          "On 20 October 2026, Circle's USDC page described USDC as a stablecoin issued by Circle and as redeemable 1:1 for US dollars. The page presented backing and redemption as Circle's own account. Ledgerline did not audit reserves.",
      },
      {
        title: "Transparency",
        publisher: "Tether",
        url: "https://tether.to/en/transparency/",
        type: "Issuer disclosure",
        published: "",
        claim:
          "On 20 October 2026, Tether's transparency page described USDT as pegged 1:1 to a matching fiat currency and as backed by Tether's reserves, and it pointed to Tether's own materials. Ledgerline does not state a reserve total.",
      },
    ],
    body: `Two tokens can both be described as dollars on a chain and still be different products: different issuers, different redemption paths, and different disclosures. This is a comparison of what those issuers publish. It is not a ranking and not financial advice.

## What Circle says about USDC

Checked on 20 October 2026, Circle's USDC page describes USDC as a stablecoin Circle issues, and it describes the token as redeemable 1:1 for US dollars. The page also describes backing in the company's own terms. Those are Circle's statements. Ledgerline has not audited Circle's holdings and does not repeat a reserve figure as its own finding.

Redemption terms matter as much as the word "redeemable." Read who Circle says can redeem, through which product, and on what conditions. A secondary-market price near one dollar is not the same thing as a redemption promise to you.

## What Tether says about USDT

Checked the same day, Tether's transparency page describes USDT as tokens pegged 1:1 to a matching fiat currency and describes them as backed by Tether's reserves. The page points readers to Tether's own materials. That is an issuer disclosure. It is not an audit commissioned by Ledgerline. This article does not state a reserve total.

## A comparison without a fake score

| Question | What to record | What not to assume |
| --- | --- | --- |
| Who issues the token? | The legal entity named on the official site | That every wrapped or bridged version has the same issuer |
| Who can redeem, and how? | The path the issuer actually describes | That a price near one dollar is a redemption right for you |
| What report is current? | The date on the issuer's own disclosure | That an older statement covers today |
| Where does it trade? | The venue, which is a separate company | That a listing is a safety review |

If the issuer's page changes after 20 October 2026, this summary is out of date. The last-checked line on this article is the warning, not a promise that the wording is still current.`,
  },
  {
    id: "art_wallets",
    slug: "comparing-wallets-without-a-hands-on-test",
    title: "A way to compare wallets without pretending you tested them",
    summary:
      "Ethereum.org's definition of a wallet is a document, not a lab result. Use it to separate key-holding tools from company accounts.",
    category: "guides",
    label: "Practical guide",
    cover: "/covers/05-wallets.svg",
    alt: "Editorial plate numbered 05 on a dark ground, labeled Guides.",
    caption: "Section plate. No wallet app was installed for this guide.",
    featured: false,
    deep: false,
    published: "2026-10-18 10:00:00+00",
    tags: ["wallets"],
    sources: [
      {
        title: "Ethereum wallets",
        publisher: "ethereum.org",
        url: "https://ethereum.org/en/wallets/",
        type: "Primary documentation",
        published: "",
        claim:
          "Ethereum.org says a wallet is a tool for interacting with an account, that it stores keys rather than the assets themselves, and that wallet providers in that explanation do not take custody of the funds.",
      },
    ],
    body: `The word "wallet" is doing too much work. Ethereum.org uses it for a tool that lets you interact with an account using keys. The same word is used in app stores for accounts at a company. Those are not the same arrangement, and a screenshot in a review is not a substitute for either document.

## What Ethereum.org actually says

Ethereum.org describes a wallet as a tool for interacting with an account. It says the wallet stores keys, not the assets, and that the assets sit on the Ethereum network. In that explanation, the wallet provider does not have custody of the funds. It provides a window and tools.

That paragraph describes the self-custody model the site is explaining. It does not describe every product that bought the word "wallet." If a product is an account, the company's terms are the document that says who can move the funds.

## A comparison that stays inside the documents

| Check | What Ethereum.org describes | What you still have to confirm |
| --- | --- | --- |
| What is stored? | Keys, not the coins themselves | Whether the product in your hand matches that description |
| Who can move funds? | The holder of the keys, in that model | Whether a company can freeze the account under its terms |
| What did Ledgerline test? | Nothing hands-on | Nothing hands-on |

Read the project documentation for how recovery is described, which networks the project says it supports, and whether the project says the code is open for inspection. Then read the company terms if the product is an account. Do not fill a blank with a guess, and do not treat this table as a ranking of named apps. No app was installed for this article.`,
  },
  {
    id: "art_keys",
    slug: "what-not-your-keys-does-not-prove",
    title: "What “not your keys” does not prove",
    summary:
      "Bitcoin.org describes the risk of letting someone else hold keys. Holding keys yourself is not a guarantee of safety or of value.",
    category: "research",
    label: "Security and risk overview",
    cover: "/covers/06-keys.svg",
    alt: "Editorial plate numbered 06 on burgundy, labeled Research.",
    caption: "Section plate. Not a picture of a real backup or a hardware device.",
    featured: false,
    deep: true,
    published: "2026-10-17 18:00:00+00",
    tags: ["custody", "security"],
    sources: [
      {
        title: "Securing your wallet",
        publisher: "Bitcoin.org",
        url: "https://bitcoin.org/en/secure-your-wallet",
        type: "Primary documentation",
        published: "",
        claim:
          "Bitcoin.org says third-party key control means relying on that party's security and honesty, and it describes backups, device encryption, and offline storage as protective practices rather than as guarantees.",
      },
    ],
    body: `Bitcoin.org says that when someone else controls the keys, you rely on their security and honesty. The slogan "not your keys, not your coins" points at that dependency. It does not prove the inverse. Holding keys is not proof that the coins are safe, spendable, or worth any particular amount.

## What self-custody does not establish

Holding keys does not prove that the software generated them correctly. It does not prove that a backup exists, that you can restore it, or that you will not lose the phrase. It does not prove that a token in the same wallet has a buyer, or that a contract you approved will behave as the interface suggested.

Those are separate questions. Mixing them into one slogan makes the slogan sound like a complete security review. It is not one.

## What the primary page does say

Bitcoin.org describes ordinary protections beside the custody question: encrypting the device, keeping a backup in a separate place, and keeping everyday amounts smaller than savings. It describes offline storage as the highest level of security for savings among the setups it discusses.

"Highest" in that sentence is Bitcoin.org's comparison, not a promise that an offline wallet is immune to a stolen backup, a coerced phrase, or a mistake. Practices reduce some losses. They do not erase them.

This is a reading of a public document. It is not a wallet review, not a product test, and not financial advice. If you act on it, the page to reread is Bitcoin.org's, on the day you act, not this paraphrase.`,
  },
  {
    id: "art_agent",
    slug: "permissions-an-ai-tool-asks-for",
    title: "Permissions an AI tool asks for are not an audit",
    summary:
      "A permission screen is the vendor's description of access. NIST's risk framework is about evaluation. Neither one is a test of a named product.",
    category: "ai",
    label: "Security and risk overview",
    cover: "/covers/07-agent.svg",
    alt: "Editorial plate numbered 07 on a dark ground, labeled AI.",
    caption: "Section plate. No agent was connected to an inbox or a repository.",
    featured: false,
    deep: false,
    published: "2026-10-17 12:00:00+00",
    tags: ["ai", "security"],
    sources: [
      {
        title: "AI Risk Management Framework",
        publisher: "NIST Information Technology Laboratory",
        url: "https://www.nist.gov/itl/ai-risk-management-framework",
        type: "Primary standards body",
        published: "2023-01-26",
        claim:
          "NIST presents the AI RMF as a voluntary framework for trustworthiness in design, development, use, and evaluation. A vendor permission prompt is not that evaluation, and the framework does not certify a product.",
      },
    ],
    body: `When a tool asks to read mail, files, a calendar, a repository, or a browser, the prompt is the vendor's description of the access it wants. Ledgerline has not connected an agent to an account for this article and has not compared any prompt with the tool's later behavior.

## A prompt is a claim about access

Write down what the screen and the docs actually say:

- Which account or store of data is in scope.
- Whether the access described is read, write, send, or delete.
- Whether the vendor says data is retained, used for training, or sent to a model provider.
- How the vendor says you revoke access, and whether that revocation sits in their product, in the other company's settings, or in both.
- The date you read the prompt.

If the documentation does not say, record "not stated." Do not fill the gap with a guess about what the company "probably" does.

## What NIST does and does not add

NIST's AI Risk Management Framework is voluntary guidance, published on 26 January 2023, for incorporating trustworthiness into the design, development, use, and evaluation of AI systems. It is not mandatory and it is not a certificate that a named agent is safe.

The relevant distinction for a buyer is simple. A framework that talks about evaluation is not a substitute for an evaluation, and a permission checkbox is not that evaluation either. This article does not claim that any local model is automatically private, or that any hosted model is automatically unsafe. Those would be test results. This desk does not have them.`,
  },
  {
    id: "art_explorer",
    slug: "what-a-block-explorer-can-show",
    title: "What a block explorer can show, and what it cannot",
    summary:
      "An explorer is a website that displays chain data. Ethereum.org describes a transaction as a signed instruction. The website is not the network.",
    category: "crypto",
    label: "Independent research",
    cover: "/covers/08-explorer.svg",
    alt: "Editorial plate numbered 08 on warm paper, labeled Crypto.",
    caption: "Section plate. Ledgerline did not operate a node for this note.",
    featured: false,
    deep: false,
    published: "2026-10-16 14:00:00+00",
    tags: ["ethereum"],
    sources: [
      {
        title: "Transactions",
        publisher: "ethereum.org",
        url: "https://ethereum.org/en/developers/docs/transactions/",
        type: "Primary documentation",
        published: "",
        claim:
          "Ethereum.org describes a transaction as a cryptographically signed instruction from an externally owned account that updates network state. It lists fields including from, to, signature, nonce, value, input data, and gas-related fields.",
      },
    ],
    body: `A public block explorer is a website that reads chain data and presents it. It is not the chain, and it is not a bank statement. Ledgerline did not run a node for this article. Where two websites disagree, this desk cannot tell you which index is current.

## What Ethereum.org says a transaction is

Ethereum.org describes an Ethereum transaction as a cryptographically signed instruction from an externally owned account that updates the state of the network, such as transferring ETH or executing contract code. The same document names fields including the sender, the recipient, a signature, a nonce, a value, input data, and gas-related fields.

An explorer page is useful when it shows those fields clearly and when you understand which site you are on. It is a window. The protocol document is the description of what the network records. Read them together, and do not treat a label the explorer invented, such as a public name beside an address, as a field the protocol proved.

## What the page does not prove

- That a person you know controls an address. An address is not an identity document.
- That a token balance is a price you can sell at.
- That a transfer was lawful, safe, or final in every legal sense.
- That the explorer company cannot lag, mislabel a token, or place a misleading advertisement beside the data.

Phishing sites copy explorers. Check the domain yourself before you trust a link from a search ad or a message. This note is not a recommendation of any explorer brand.`,
  },
  {
    id: "art_custody",
    slug: "custodial-and-self-custody-wallets",
    title: "Custodial accounts and self-custody wallets solve different problems",
    summary:
      "One product is a company's account. The other, in Ethereum.org's description, is a tool for keys. The labels in an app store do not decide which is which.",
    category: "comparisons",
    label: "Feature comparison",
    cover: "/covers/09-custody.svg",
    alt: "Editorial plate numbered 09 on a dark ground, labeled Reviews.",
    caption: "Section plate for a document comparison, not a product shoot.",
    featured: false,
    deep: false,
    published: "2026-10-16 09:00:00+00",
    tags: ["wallets", "custody"],
    sources: [
      {
        title: "Ethereum wallets",
        publisher: "ethereum.org",
        url: "https://ethereum.org/en/wallets/",
        type: "Primary documentation",
        published: "",
        claim:
          "Ethereum.org's wallet explanation says providers in that model do not custody funds and that the wallet holds keys rather than assets.",
      },
      {
        title: "Securing your wallet",
        publisher: "Bitcoin.org",
        url: "https://bitcoin.org/en/secure-your-wallet",
        type: "Primary documentation",
        published: "",
        claim:
          "Bitcoin.org warns that third-party control of keys creates reliance on that party's security and honesty, including the possibility of hacks, failure, or frozen access.",
      },
    ],
    body: `A comparison is not a winner. Custodial accounts and self-custody tools fail in different ways, and Ledgerline has not stress-tested either kind of product.

## Two descriptions from primary pages

Ethereum.org says a wallet, in the model it is explaining, stores keys rather than coins and that the provider does not have custody of the funds. Bitcoin.org says that if someone else holds the keys, you are relying on their security and honesty, and that exchanges and online wallets can be hacked, fail, or freeze access.

Put those sentences next to each other and the product question becomes specific. Does the thing you are about to use match Ethereum.org's description of a key-holding tool, or does it match Bitcoin.org's description of a third party holding keys? The icon labeled "wallet" does not answer that. The project's documentation and the company's terms do.

## What a fair comparison records

| Question | Self-custody, as the protocol docs describe it | Custodial account |
| --- | --- | --- |
| Who can move the funds? | The holder of the keys | The company, under the rules it publishes |
| What is the obvious loss? | A lost phrase or a bad signature | A freeze, a hack, or a failure at the company |
| What did this desk test? | No installation and no deposit | No account and no deposit |

Recovery, fees, supported networks, and regional limits still have to be read on the current official pages. This table does not fill them in, and it does not name a product to buy. It is not financial advice.`,
  },
  {
    id: "art_plans",
    slug: "comparing-developer-tool-plans",
    title: "How to compare developer-tool plans when the pricing page is the source",
    summary:
      "Seats, usage, regions, and support promises are only as solid as the page that states them. This is a reading method, not a benchmark.",
    category: "saas",
    label: "Pricing analysis",
    cover: "/covers/10-plans.svg",
    alt: "Editorial plate numbered 10 on warm paper, labeled SaaS.",
    caption: "Section plate. No developer tool was benchmarked.",
    featured: false,
    deep: false,
    published: "2026-10-15 13:00:00+00",
    tags: ["saas", "pricing"],
    sources: [
      {
        title: "Editorial standards",
        publisher: "Ledgerline",
        url: "https://example.com/standards",
        type: "Editorial standard",
        published: "2026-10-20",
        claim:
          "Ledgerline does not present a pricing-page summary as a performance test. This article is a method for reading vendor pages, which is what the desk's standards allow.",
      },
    ],
    body: `Developer tools are often sold with a grid: a free tier, a team tier, and a sentence about "enterprise." The grid is the vendor's claim about packaging. It is not a benchmark of speed, uptime, or code quality. Ledgerline did not run a suite against any tool for this note.

## Copy the plan, not the adjective

For each column on the pricing page, record:

- Whether you pay per seat, per usage, or both.
- What the page says is excluded, not only what it says is included.
- Whether support, uptime, or a security review is promised in the plan text or only in a separate sales conversation.
- Whether the docs say the product is available in your region.
- The date you read the page.

If a status page exists, it is history the company chose to show. It is not a promise about next quarter unless a contract says so. Do not convert a green checkmark into a measurement the page did not publish.

## Keep the label honest

Call this a pricing analysis when you are comparing published plans. Call it a test only when someone actually ran the product and you can say who did, on what date, and what they measured. This article is the first kind. It cites Ledgerline's editorial standards because the point of the piece is that limit: a vendor grid is not a lab result.

When you need a number, open the vendor's page again. Do not quote this article as the price.`,
  },
];

function words(markdown) {
  return Math.max(1, Math.round(markdown.trim().split(/\s+/).filter(Boolean).length / 220));
}

function q(value) {
  return value.replaceAll("'", "''");
}

const schema = `
create table if not exists profiles (
  user_id text primary key,
  display_name text not null default '',
  bio text not null default '',
  role text not null default 'writer' check (role in ('admin', 'editor', 'writer')),
  x_handle text not null default '',
  x_url text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists categories (
  slug text primary key,
  name text not null,
  description text not null,
  sort_order integer not null default 0
);

create table if not exists articles (
  id text primary key,
  slug text not null unique,
  title text not null,
  summary text not null default '',
  body text not null default '',
  status text not null default 'draft' check (status in ('draft', 'review', 'published', 'archived')),
  category_slug text not null references categories (slug),
  author_id text not null,
  seo_title text not null default '',
  seo_description text not null default '',
  cover_image text not null default '',
  cover_alt text not null default '',
  cover_caption text not null default '',
  featured boolean not null default false,
  deep_dive boolean not null default false,
  label text not null default 'Practical guide',
  last_checked date,
  affiliate_disclosure boolean not null default false,
  reading_minutes integer not null default 1,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  draft_json text
);

create table if not exists tags (
  slug text primary key,
  name text not null
);

create table if not exists article_tags (
  article_id text not null references articles (id) on delete cascade,
  tag_slug text not null references tags (slug),
  primary key (article_id, tag_slug)
);

create table if not exists article_sources (
  id text primary key,
  article_id text not null references articles (id) on delete cascade,
  title text not null,
  publisher text not null,
  url text not null,
  source_type text not null,
  published_on date,
  accessed_on date,
  claim text not null,
  sort_order integer not null default 0
);

create table if not exists affiliates (
  id text primary key,
  name text not null,
  category text not null default '',
  website text not null default '',
  affiliate_url text not null default '',
  program_name text not null default '',
  commission_notes text not null default '',
  commission_type text not null default 'undocumented' check (commission_type in ('undocumented', 'one-time', 'recurring')),
  cookie_notes text not null default '',
  eligibility text not null default '',
  approval_status text not null default 'not_applied' check (approval_status in ('not_applied', 'pending', 'approved', 'rejected', 'inactive')),
  notes text not null default '',
  last_verified date,
  active boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists article_affiliates (
  article_id text not null references articles (id) on delete cascade,
  affiliate_id text not null references affiliates (id) on delete cascade,
  primary key (article_id, affiliate_id)
);

create table if not exists subscribers (
  id text primary key,
  email text not null unique,
  status text not null default 'subscribed' check (status in ('subscribed', 'unsubscribed')),
  consent boolean not null default false,
  unsubscribe_token text not null unique,
  created_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

create table if not exists comments (
  id text primary key,
  article_id text not null references articles (id) on delete cascade,
  author_name text not null,
  body text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists contact_messages (
  id text primary key,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table if not exists slug_redirects (
  from_slug text primary key,
  to_slug text not null
);

create table if not exists affiliate_clicks (
  id text primary key,
  affiliate_id text not null references affiliates (id) on delete cascade,
  article_id text,
  created_at timestamptz not null default now()
);

create table if not exists revisions (
  id text primary key,
  article_id text not null references articles (id) on delete cascade,
  actor_id text not null,
  action text not null,
  created_at timestamptz not null default now()
);

create table if not exists site_settings (
  id integer primary key check (id = 1),
  site_name text not null default 'Ledgerline',
  tagline text not null default 'Research before you pay.',
  contact_email text not null default '',
  public_url text not null default '',
  x_url text not null default '',
  author_name text not null default 'Ledgerline Desk',
  author_bio text not null default '',
  newsletter_configured boolean not null default false,
  comments_enabled boolean not null default true
);

create index if not exists articles_status_published_idx on articles (status, published_at desc);
create index if not exists articles_category_idx on articles (category_slug, status);
create index if not exists comments_article_idx on comments (article_id, status);

insert into site_settings (
  id, site_name, tagline, contact_email, public_url, x_url, author_name, author_bio,
  newsletter_configured, comments_enabled
) values (
  1,
  'Ledgerline',
  'Research before you pay.',
  '',
  '',
  '',
  'Ledgerline Desk',
  'Ledgerline is an independent research desk covering cryptocurrency, artificial intelligence, and software subscriptions. It reads official documentation, pricing pages, and primary sources. It does not custody funds, and it does not give financial, legal, or investment advice. A hands-on test appears only when an article says who performed it.',
  false,
  true
) on conflict (id) do nothing;

insert into categories (slug, name, description, sort_order) values
  ('crypto', 'Crypto', 'Custody, exchanges, stablecoins, and the primary documents behind them. Not price targets.', 1),
  ('ai', 'AI', 'Models, agents, and the pricing and permission pages that decide what a subscription actually is.', 2),
  ('saas', 'SaaS', 'Trials, seats, and the clauses that decide what a software subscription costs after the first screen.', 3),
  ('guides', 'Guides', 'Practical methods for reading documentation before you pay or connect an account.', 4),
  ('comparisons', 'Comparisons', 'Feature comparisons of public descriptions. Not hands-on rankings.', 5),
  ('research', 'Research', 'Longer risk and security notes tied to primary sources and a last-checked date.', 6)
on conflict (slug) do nothing;
`;

let seed = schema;
for (const article of articles) {
  const minutes = words(article.body);
  seed += `
insert into articles (
  id, slug, title, summary, body, status, category_slug, author_id, label,
  seo_title, seo_description, cover_image, cover_alt, cover_caption,
  featured, deep_dive, last_checked, affiliate_disclosure, reading_minutes, published_at, updated_at
) values (
  '${article.id}',
  '${article.slug}',
  '${q(article.title)}',
  '${q(article.summary)}',
  $ll_${article.id}$
${article.body}
$ll_${article.id}$,
  'published',
  '${article.category}',
  'desk',
  '${q(article.label)}',
  '${q(article.title)}',
  '${q(article.summary)}',
  '${article.cover}',
  '${q(article.alt)}',
  '${q(article.caption)}',
  ${article.featured},
  ${article.deep},
  '2026-10-20',
  false,
  ${minutes},
  '${article.published}',
  '${article.published}'
) on conflict (id) do nothing;
`;
  article.sources.forEach((source, index) => {
    const url =
      source.url === "https://example.com/standards" ? "/standards" : source.url;
    seed += `
insert into article_sources (
  id, article_id, title, publisher, url, source_type, published_on, accessed_on, claim, sort_order
) values (
  '${article.id}_s${index}',
  '${article.id}',
  '${q(source.title)}',
  '${q(source.publisher)}',
  '${q(url)}',
  '${q(source.type)}',
  ${source.published ? `'${source.published}'` : "null"},
  '2026-10-20',
  '${q(source.claim)}',
  ${index}
) on conflict (id) do nothing;
`;
  });
  for (const tag of article.tags) {
    const slug = tag.toLowerCase();
    seed += `
insert into tags (slug, name) values ('${slug}', '${q(tag)}') on conflict (slug) do nothing;
insert into article_tags (article_id, tag_slug) values ('${article.id}', '${slug}') on conflict do nothing;
`;
  }
}

writeFileSync("/workspace/migrations/0002_ledgerline.sql", seed);
console.log("wrote migration", seed.length);
