import { useState } from "react";
import { saveOpportunity, type AdminOpportunity } from "@/lib/editorial/opportunities-admin";
import { CampaignEditor } from "./campaign-editor";
import { LinksEditor, TeamEditor } from "./lists-editor";
import { ProjectFields } from "./project-fields";

export const BLANK: AdminOpportunity = {
  id: "",
  slug: "",
  name: "",
  logoUrl: "",
  chain: "",
  summary: "",
  about: "",
  whyNote: "",
  backers: "",
  raised: "",
  raisedSource: "",
  raisedOn: "",
  category: "",
  tags: "",
  officialUrl: "",
  riskNote: "",
  sponsored: false,
  status: "draft",
  verifiedOn: "",
  team: [],
  links: [],
  campaigns: [],
};

export function OpportunityForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: AdminOpportunity;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [note, setNote] = useState("");
  const set = (patch: Partial<AdminOpportunity>) => setForm((f) => ({ ...f, ...patch }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      const r = await saveOpportunity({ data: form });
      setForm((f) => ({ ...f, id: r.id }));
      setNote(`Saved with ${r.campaigns} campaign${r.campaigns === 1 ? "" : "s"}.`);
      onSaved();
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Could not save.");
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-3 md:grid-cols-2">
      <ProjectFields form={form} set={set} />
      <CampaignEditor campaigns={form.campaigns} onChange={(campaigns) => set({ campaigns })} />
      <TeamEditor team={form.team} onChange={(team) => set({ team })} />
      <LinksEditor links={form.links} onChange={(links) => set({ links })} />
      <button type="submit" className="min-h-11 bg-ink px-4 text-sm font-semibold text-inverse-fg">
        Save listing
      </button>
      <button type="button" onClick={onCancel} className="min-h-11 border border-line px-4 text-sm font-semibold">
        New / clear form
      </button>
      {note ? <p className="text-sm md:col-span-2">{note}</p> : null}
    </form>
  );
}
