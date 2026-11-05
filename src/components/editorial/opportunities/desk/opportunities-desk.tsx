import { useState } from "react";
import { markVerified } from "@/lib/editorial/opportunities-admin";
import { BLANK, OpportunityForm } from "./opportunity-form";
import { OpportunityRow } from "./opportunity-row";
import { useOpportunities } from "./use-opportunities";

export function OpportunitiesDesk() {
  const { data, error, reload } = useOpportunities();
  const [selected, setSelected] = useState(BLANK);
  const [formKey, setFormKey] = useState(0);

  if (error) return <p className="text-accent">{error}</p>;
  if (!data) return <p>Loading listings…</p>;

  function edit(item: typeof BLANK) {
    setSelected(item);
    setFormKey((k) => k + 1);
  }

  return (
    <main>
      <h1 className="font-serif text-4xl font-semibold">Opportunities</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        A listing is shown to readers only when it is published, verified within the last 14 days, and not past
        its deadline. Check the official page yourself before marking anything verified.
      </p>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {data.map((item) => (
          <OpportunityRow
            key={item.id}
            item={item}
            onEdit={() => edit(item)}
            onVerify={async () => {
              await markVerified({ data: { id: item.id } });
              await reload();
            }}
          />
        ))}
        {data.length === 0 ? <li className="py-3 text-muted">No listings yet.</li> : null}
      </ul>
      <OpportunityForm
        key={formKey}
        initial={selected}
        onSaved={() => {
          void reload();
        }}
        onCancel={() => edit(BLANK)}
      />
    </main>
  );
}
