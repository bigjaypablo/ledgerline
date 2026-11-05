import * as Dialog from "@radix-ui/react-dialog";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import {
  buildSearch,
  CAPITAL_OPTIONS,
  KIND_OPTIONS,
  REWARD_OPTIONS,
  type Current,
} from "./filter-utils";

function Group({
  label,
  field,
  options,
  current,
  onPick,
}: {
  label: string;
  field: keyof Current;
  options: ReadonlyArray<readonly [string, string]>;
  current: Current;
  onPick: () => void;
}) {
  return (
    <div className="mt-5">
      <h3 className="text-xs font-bold tracking-widest text-muted uppercase">{label}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map(([value, text]) => {
          const on = current[field] === value;
          return (
            <Link
              key={value}
              to="/opportunities"
              search={buildSearch(current, { [field]: on ? "" : value })}
              onClick={onPick}
              aria-pressed={on}
              className={`inline-flex min-h-11 items-center border px-4 text-sm font-semibold ${
                on ? "border-ink bg-ink text-inverse-fg" : "border-line"
              }`}
            >
              {text}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function OpportunityFilterSheet({
  open,
  onOpenChange,
  current,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: Current;
}) {
  const close = () => onOpenChange(false);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto border-t border-ink bg-card p-5 text-ink">
          <div className="flex items-center justify-between">
            <Dialog.Title className="font-serif text-2xl font-semibold">Filters</Dialog.Title>
            <Dialog.Close className="inline-flex min-h-11 min-w-11 items-center justify-center" aria-label="Close filters">
              <X className="size-5" aria-hidden />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">Filter airdrops by type, reward and capital.</Dialog.Description>
          <Group label="Type" field="kind" options={KIND_OPTIONS} current={current} onPick={close} />
          <Group label="Reward" field="rewardStatus" options={REWARD_OPTIONS} current={current} onPick={close} />
          <Group label="Capital" field="capital" options={CAPITAL_OPTIONS} current={current} onPick={close} />
          <Link
            to="/opportunities"
            search={{}}
            onClick={close}
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center border border-line text-sm font-semibold"
          >
            Reset all
          </Link>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
