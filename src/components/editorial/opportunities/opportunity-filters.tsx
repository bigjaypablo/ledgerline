import { useState } from "react";
import { OpportunityChips } from "./opportunity-chips";
import { OpportunityFilterSheet } from "./opportunity-filter-sheet";
import { OpportunityTabs } from "./opportunity-tabs";
import type { Current } from "./filter-utils";

export function OpportunityFilters(current: Current) {
  const [open, setOpen] = useState(false);
  const count = [current.rewardStatus, current.capital].filter(Boolean).length;
  return (
    <div>
      <OpportunityTabs current={current} onOpen={() => setOpen(true)} count={count} />
      <OpportunityChips current={current} />
      <OpportunityFilterSheet open={open} onOpenChange={setOpen} current={current} />
    </div>
  );
}
