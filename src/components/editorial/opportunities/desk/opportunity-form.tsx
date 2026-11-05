import { useState } from "react";
import { saveOpportunity, type AdminOpportunity } from "@/lib/editorial/opportunities-admin";
import { Field, SelectField } from "./field";

export const BLANK: AdminOpportunity = {
  id: "",
  slug: "",
  name: "",
  chain: "",
  kind: "testnet",
  rewardStatus: "potential",
  summary: "",
  capital: "gas_only",
  costNote: "",
  timeMinutes: "",
  deadline: "",
  officialUrl: "",
  riskNote: "",
  sponsored: false,
  status: "draft",
  verifiedOn: "",
};

const KIND = [["testnet", "Testnet"], ["points", "Points"], ["airdrop", "Airdrop"]] as const;
const REWARD = [["confirmed", "Confirmed"], ["potential", "Potential"], ["none", "None announced"]] as const;
const CAPITAL = [["none", "No capital needed"], ["gas_only", "Gas fees only"], ["funds_at_risk", "Funds at risk"]] as const;
const STATUS = [["draft", "Draft"], ["published", "Published"], ["archived", "Archived"]] as const;

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
  const set = (patch: Partial<AdminOpportunity>) => setForm({ ...form, ...patch });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      await saveOpportunity({ data: form });
      setNote("Saved.");
      onSaved();
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Could not save.");
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-3 md:grid-cols-2">
      <Field label="Project name" value={form.name} onChange={(name) => set({ name })} />
      <Field label="Chain / ecosystem" value={form.chain} onChange={(chain) => set({ chain })} />
      <SelectField label="Type" value={form.kind} onChange={(kind) => set({ kind })} options={KIND} />
      <SelectField label="Reward status" value={form.rewardStatus} onChange={(rewardStatus) => set({ rewardStatus })} options={REWARD} />
      <SelectField label="Capital needed" value={form.capital} onChange={(capital) => set({ capital })} options={CAPITAL} />
      <Field label="Cost note (e.g. about $5 in fees)" value={form.costNote} onChange={(costNote) => set({ costNote })} />
      <Field label="Time needed (minutes)" value={form.timeMinutes} onChange={(timeMinutes) => set({ timeMinutes })} type="number" />
      <Field label="Deadline" value={form.deadline} onChange={(deadline) => set({ deadline })} type="date" />
      <Field label="Official page (https://)" value={form.officialUrl} onChange={(officialUrl) => set({ officialUrl })} />
      <Field label="Verified on" value={form.verifiedOn} onChange={(verifiedOn) => set({ verifiedOn })} type="date" />
      <SelectField label="Status" value={form.status} onChange={(status) => set({ status })} options={STATUS} />
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" checked={form.sponsored} onChange={(event) => set({ sponsored: event.target.checked })} />
        Sponsored (paid placement)
      </label>
      <label className="text-sm font-semibold md:col-span-2">
        Summary
        <textarea value={form.summary} onChange={(event) => set({ summary: event.target.value })} className="mt-1 min-h-20 w-full border border-line bg-card px-3 py-2" />
      </label>
      <label className="text-sm font-semibold md:col-span-2">
        Risk note (one line)
        <textarea value={form.riskNote} onChange={(event) => set({ riskNote: event.target.value })} className="mt-1 min-h-16 w-full border border-line bg-card px-3 py-2" />
      </label>
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
