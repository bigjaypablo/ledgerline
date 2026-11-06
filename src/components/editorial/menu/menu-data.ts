export const LIBRARY = [
  { to: "/crypto", label: "Crypto" },
  { to: "/guides", label: "Guides" },
  { to: "/comparisons", label: "Comparisons" },
  { to: "/research", label: "Research" },
  { to: "/archive", label: "Archive" },
] as const;

export const OPPORTUNITY_FILTERS = [
  { kind: "testnet", label: "Testnets" },
  { kind: "points", label: "Points programs" },
  { kind: "airdrop", label: "Token rewards" },
] as const;

export const ABOUT_LINKS = [
  { to: "/about", label: "About Ledgerline" },
  { to: "/standards", label: "Editorial standards" },
  { to: "/corrections", label: "Corrections" },
  { to: "/contact", label: "Contact" },
  { to: "/disclosure", label: "Affiliate disclosure" },
  { to: "/disclaimer", label: "Research disclaimer" },
  { to: "/privacy", label: "Privacy policy" },
  { to: "/terms", label: "Terms of service" },
] as const;
