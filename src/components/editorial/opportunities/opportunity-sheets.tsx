import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { REWARD_TYPES, TASK_TYPES } from "@/lib/editorial/opportunity-types";
import { REWARD_TYPE_LABEL, STATUS_TAG, TASK_LABEL } from "./labels";
import { flip, RAISE_OPTIONS, EMPTY, type Filters, type Sort } from "./filter-state";

type Opt = ReadonlyArray<readonly [string, string]>;
export type Opts = { categories: string[]; tags: string[]; chains: string[] };

const pill = "inline-flex min-h-11 items-center border px-3 text-sm font-semibold ";
const on = "border-ink bg-ink text-inverse-fg";

function Chip(p: { text: string; active: boolean; onClick: () => void }) {
  const cls = pill + (p.active ? on : "border-line");
  return (
    <button type="button" aria-pressed={p.active} onClick={p.onClick} className={cls}>
      {p.text}
    </button>
  );
}

function Group(p: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h3 className="text-xs font-bold tracking-widest text-muted uppercase">{p.label}</h3>
      <div className="mt-2 flex flex-wrap gap-2">{p.children}</div>
    </div>
  );
}

function Multi(p: { label: string; options: Opt; picked: string[]; set: (v: string[]) => void }) {
  if (p.options.length === 0) return null;
  return (
    <Group label={p.label}>
      {p.options.map(([v, t]) => (
        <Chip key={v} text={t} active={p.picked.includes(v)} onClick={() => p.set(flip(p.picked, v))} />
      ))}
    </Group>
  );
}

function Shell(p: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={p.open} onOpenChange={p.onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto border-t border-ink bg-card p-5 font-sans text-ink">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-2xl font-medium">{p.title}</Dialog.Title>
            <Dialog.Close className="inline-flex min-h-11 min-w-11 items-center justify-center" aria-label="Close">
              <X className="size-5" aria-hidden />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">{p.title}</Dialog.Description>
          {p.children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const pair = (list: string[]): Opt => list.map((x) => [x, x] as const);

export function FilterSheet(p: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  f: Filters;
  setF: (f: Filters) => void;
  opts: Opts;
  shown: number;
}) {
  const { f, setF } = p;
  const tasks: Opt = TASK_TYPES.map((t) => [t, TASK_LABEL[t]] as const);
  const rewards: Opt = REWARD_TYPES.map((t) => [t, REWARD_TYPE_LABEL[t]] as const);
  const statuses: Opt = Object.entries(STATUS_TAG);
  return (
    <Shell open={p.open} onOpenChange={p.onOpenChange} title="Filters">
      <Multi label="Task type" options={tasks} picked={f.tasks} set={(tasks) => setF({ ...f, tasks })} />
      <Multi label="Reward type" options={rewards} picked={f.rewards} set={(rewards) => setF({ ...f, rewards })} />
      <Multi label="Status" options={statuses} picked={f.statuses} set={(statuses) => setF({ ...f, statuses })} />
      <Multi label="Category" options={pair(p.opts.categories)} picked={f.categories} set={(categories) => setF({ ...f, categories })} />
      <Multi label="Tags" options={pair(p.opts.tags)} picked={f.tags} set={(tags) => setF({ ...f, tags })} />
      <Multi label="Ecosystem" options={pair(p.opts.chains)} picked={f.chains} set={(chains) => setF({ ...f, chains })} />
      <Group label="Total raised">
        {RAISE_OPTIONS.map(([v, t]) => (
          <Chip key={v} text={t} active={f.raise === v} onClick={() => setF({ ...f, raise: f.raise === v ? "" : v })} />
        ))}
      </Group>
      <Group label="Activity">
        <Chip text="New this week" active={f.isNew} onClick={() => setF({ ...f, isNew: !f.isNew })} />
        <Chip text="Status updated this week" active={f.updated} onClick={() => setF({ ...f, updated: !f.updated })} />
      </Group>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button type="button" onClick={() => setF(EMPTY)} className="min-h-12 border border-line text-sm font-semibold">
          Reset all
        </button>
        <button type="button" onClick={() => p.onOpenChange(false)} className="min-h-12 bg-ink text-sm font-semibold text-inverse-fg">
          Show {p.shown}
        </button>
      </div>
    </Shell>
  );
}

const SORTS: Opt = [
  ["updated", "Latest status update"],
  ["new", "Newest added"],
  ["deadline", "Soonest deadline"],
  ["raise", "Biggest raise"],
];

export function SettingsSheet(p: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  sort: Sort;
  setSort: (s: Sort) => void;
  compact: boolean;
  setCompact: (c: boolean) => void;
}) {
  return (
    <Shell open={p.open} onOpenChange={p.onOpenChange} title="Sort and view">
      <Group label="Sort by">
        {SORTS.map(([v, t]) => (
          <Chip key={v} text={t} active={p.sort === v} onClick={() => p.setSort(v as Sort)} />
        ))}
      </Group>
      <Group label="Layout">
        <Chip text="Cards" active={!p.compact} onClick={() => p.setCompact(false)} />
        <Chip text="Compact" active={p.compact} onClick={() => p.setCompact(true)} />
      </Group>
      <button type="button" onClick={() => p.onOpenChange(false)} className="mt-6 min-h-12 w-full bg-ink text-sm font-semibold text-inverse-fg">
        Done
      </button>
    </Shell>
  );
}
