import { useCallback, useEffect, useState } from "react";
import { listOpportunities, type AdminOpportunity } from "@/lib/editorial/opportunities-admin";

export function useOpportunities() {
  const [data, setData] = useState<AdminOpportunity[] | null>(null);
  const [error, setError] = useState("");
  const reload = useCallback(async () => {
    try {
      setData(await listOpportunities());
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load listings.");
    }
  }, []);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, error, reload };
}
