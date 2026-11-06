import { PublicShell } from "@/components/editorial/shell";
import type { OpportunityDetail } from "@/lib/editorial/opportunity-detail";
import { OpportunityNotice } from "../opportunity-notice";
import { DetailCampaigns } from "./detail-campaigns";
import { DetailFacts } from "./detail-facts";
import { DetailHeader } from "./detail-header";
import { DetailLinks, DetailTeam } from "./detail-people-links";
import { Paragraphs, Section } from "./section";

export function OpportunityDetailView({ item }: { item: OpportunityDetail }) {
  return (
    <PublicShell>
      <main className="sheet py-8">
        <div className="mx-auto max-w-3xl">
          <DetailHeader item={item} />
          {item.ended || item.stale ? (
            <p className="mt-4 border border-accent bg-card px-3 py-2 text-sm">
              {item.ended
                ? "Every campaign for this project has ended."
                : "We have not re-verified this listing in the last 14 days. Check the official page before acting."}
            </p>
          ) : null}
          <DetailFacts item={item} />
          {item.about ? <Section title="About the project"><Paragraphs text={item.about} /></Section> : null}
          {item.campaigns.length > 0 ? <Section title="Campaigns"><DetailCampaigns campaigns={item.campaigns} /></Section> : null}
          {item.whyNote ? <Section title="Why it may be worth your time"><Paragraphs text={item.whyNote} /></Section> : null}
          {item.backers ? <Section title="Backers"><p className="text-base leading-7">{item.backers}</p></Section> : null}
          {item.team.length > 0 ? <Section title="Team"><DetailTeam team={item.team} /></Section> : null}
          {item.links.length > 0 ? <Section title="Links"><DetailLinks links={item.links} /></Section> : null}
          {item.riskNote ? (
            <Section title="Risks">
              <p className="border-l-2 border-accent pl-3 text-base leading-7">{item.riskNote}</p>
            </Section>
          ) : null}
          <p className="mt-8 text-xs text-muted">
            Verified {item.verifiedOn || "never"} ·{" "}
            <a href={item.officialUrl} target="_blank" rel="noopener noreferrer nofollow" className="underline hover:text-accent">
              Official page
            </a>
          </p>
          <OpportunityNotice />
        </div>
      </main>
    </PublicShell>
  );
}
