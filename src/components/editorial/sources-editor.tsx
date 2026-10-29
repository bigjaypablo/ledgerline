import type { ArticleInput, SourceInput } from "@/lib/editorial/types";

export const emptySource = (): SourceInput => ({
  title: "",
  publisher: "",
  url: "",
  sourceType: "Primary documentation",
  publishedOn: "",
  accessedOn: "",
  claim: "",
});

const FIELDS = [
  ["title", "Title"],
  ["publisher", "Publisher"],
  ["url", "URL"],
  ["sourceType", "Source type"],
  ["publishedOn", "Published"],
  ["accessedOn", "Accessed"],
] as const;

export function SourcesEditor({ form, onChange }: { form: ArticleInput; onChange: (next: ArticleInput) => void }) {
  function patch(index: number, change: Partial<SourceInput>) {
    const sources = form.sources.slice();
    sources[index] = { ...sources[index], ...change };
    onChange({ ...form, sources });
  }
  return (
    <section className="mt-6">
      <h2 className="font-serif text-2xl font-semibold">Sources</h2>
      {form.sources.map((source, index) => (
        <div key={index} className="mt-3 grid gap-2 border border-line bg-card p-3 md:grid-cols-2">
          {FIELDS.map(([key, label]) => (
            <label key={key} className="text-sm font-semibold">
              {label}
              <input
                type={key.endsWith("On") ? "date" : "text"}
                value={source[key]}
                onChange={(event) => patch(index, { [key]: event.target.value })}
                className="mt-1 min-h-11 w-full border border-line px-3"
              />
            </label>
          ))}
          <label className="text-sm font-semibold md:col-span-2">
            Claim this source supports
            <textarea value={source.claim} onChange={(event) => patch(index, { claim: event.target.value })} className="mt-1 min-h-20 w-full border border-line px-3 py-2" />
          </label>
        </div>
      ))}
      <button type="button" className="mt-3 min-h-11 border border-line px-3 text-sm" onClick={() => onChange({ ...form, sources: [...form.sources, emptySource()] })}>
        Add source
      </button>
    </section>
  );
}
