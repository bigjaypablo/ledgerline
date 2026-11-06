import type { AdminOpportunity } from "@/lib/editorial/opportunities-admin";
import { Field, SelectField } from "./field";
import { LogoUpload } from "./logo-upload";
import { TextArea } from "./text-area";

const CATEGORY = [
  ["", "Not set"],
  ["DeFi", "DeFi"],
  ["Perps", "Perps"],
  ["Gaming", "Gaming"],
  ["NFT", "NFT"],
  ["Infrastructure", "Infrastructure"],
  ["AI", "AI"],
  ["Wallet", "Wallet"],
  ["Social", "Social"],
  ["Prediction", "Prediction markets"],
  ["Other", "Other"],
] as const;

const STATUS = [["draft", "Draft"], ["published", "Published"], ["archived", "Archived"]] as const;

export function ProjectFields({ form, set }: { form: AdminOpportunity; set: (patch: Partial<AdminOpportunity>) => void }) {
  return (
    <>
      <LogoUpload name={form.name} url={form.logoUrl} onChange={(logoUrl) => set({ logoUrl })} />
      <Field label="Project name" value={form.name} onChange={(name) => set({ name })} />
      <Field label="Chains / ecosystems" value={form.chain} onChange={(chain) => set({ chain })} />
      <Field label="Official page (https://)" value={form.officialUrl} onChange={(officialUrl) => set({ officialUrl })} />
      <Field label="Verified on" value={form.verifiedOn} onChange={(verifiedOn) => set({ verifiedOn })} type="date" />
      <SelectField label="Status" value={form.status} onChange={(status) => set({ status })} options={STATUS} />
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" checked={form.sponsored} onChange={(event) => set({ sponsored: event.target.checked })} />
        Sponsored (paid placement)
      </label>
      <div className="md:col-span-2">
        <TextArea label="One-line summary (shown on the card)" value={form.summary} onChange={(summary) => set({ summary })} rows={2} />
      </div>
      <div className="md:col-span-2">
        <TextArea label="About the project" value={form.about} onChange={(about) => set({ about })} rows={5} hint="Only what you verified on the project's own site or docs." />
      </div>
      <div className="md:col-span-2">
        <TextArea label="Why it may be worth your time" value={form.whyNote} onChange={(whyNote) => set({ whyNote })} rows={3} />
      </div>
      <Field label="Backers (names, comma separated)" value={form.backers} onChange={(backers) => set({ backers })} />
      <Field label="Funding raised (e.g. $9.5M)" value={form.raised} onChange={(raised) => set({ raised })} />
      <Field label="Raise source link (https://)" value={form.raisedSource} onChange={(raisedSource) => set({ raisedSource })} />
      <Field label="Raise reported on" value={form.raisedOn} onChange={(raisedOn) => set({ raisedOn })} type="date" />
      <SelectField label="Category" value={form.category} onChange={(category) => set({ category })} options={CATEGORY} />
      <Field label="Tags (comma separated)" value={form.tags} onChange={(tags) => set({ tags })} />
      <div className="md:col-span-2">
        <TextArea label="Key risks" value={form.riskNote} onChange={(riskNote) => set({ riskNote })} rows={2} />
      </div>
    </>
  );
}
