import type { Step } from "@/lib/editorial/opportunity-types";
import { Field } from "./field";
import { TextArea } from "./text-area";

export function StepsEditor({ steps, onChange }: { steps: Step[]; onChange: (next: Step[]) => void }) {
  const set = (i: number, patch: Partial<Step>) => onChange(steps.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  return (
    <div className="md:col-span-2">
      <p className="text-sm font-semibold">Steps (in your own words)</p>
      <ol className="mt-2 space-y-3">
        {steps.map((s, i) => (
          <li key={i} className="border border-line p-3">
            <TextArea label={`Step ${i + 1}`} value={s.text} onChange={(text) => set(i, { text })} rows={2} />
            <div className="mt-2">
              <Field label="Link for this step (https://, optional)" value={s.url} onChange={(url) => set(i, { url })} />
            </div>
            <button type="button" onClick={() => onChange(steps.filter((_, j) => j !== i))} className="mt-2 min-h-11 text-sm font-semibold text-accent">
              Remove step
            </button>
          </li>
        ))}
      </ol>
      <button type="button" onClick={() => onChange([...steps, { text: "", url: "" }])} className="mt-2 min-h-11 border border-line px-4 text-sm font-semibold">
        + Add step
      </button>
    </div>
  );
}
