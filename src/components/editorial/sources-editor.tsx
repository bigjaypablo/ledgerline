import { Icon } from "@/components/editorial/icons";
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

const today = () => new Date().toLocaleDateString("en-CA");

const FIELDS = [
  ["title", "Title", "Name of the page or document"],
  ["publisher", "Publisher", "Who published it, e.g. Binance Research"],
  ["url", "URL", "https://example.com/page"],
  ["sourceType", "Source type", "e.g. Primary documentation"],
  ["publishedOn", "Published", ""],
  ["accessedOn", "Accessed", ""],
] as const;

export function SourcesEditor({ form, onChange }: { form: ArticleInput; onChange: (next: ArticleInput) => void }) {
  function patch(index: number, change: Partial<SourceInput>) {
    const sources = form.sources.slice();
    sources[index] = { ...sources[index], ...change };
    onChange({ ...form, sources });
  }

  function add() {
    const last = form.sources[form.sources.length - 1];
    const next = { ...emptySource(), sourceType: last?.sourceType || "Primary documentation", accessedOn: last?.accessedOn || today() };
    onChange({ ...form, sources: [...form.sources, next] });
  }

  function remove(index: number) {
    onChange({ ...form, sources: form.sources.filter((_, i) => i !== index) });
  }

  return (
    <section className="mt-6">
      <h2 className="font-serif text-2xl font-semibold">Sources</h2>
      {form.sources.map((source, index) => (
        <div key={index} className="mt-3 border border-line bg-card p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold tracking-widest uppercase text-muted">Source {index + 1}</p>
            {form.sources.length > 1 ? (
              <button type="button" title="Remove source" aria-label={`Remove source ${index + 1}`} className="inline-flex h-9 w-9 items-center justify-center border border-line" onClick={() => remove(index)}>
                <Icon n="trash" />
              </button>
            ) : null}
          </div>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {FIELDS.map(([key, label, hint]) => (
              <label key={key} className="text-sm font-semibold">
                {label}
                <div className="mt-1 flex gap-2">
                  <input
                    type={key.endsWith("On") ? "date" : "text"}
                    value={source[key]}
                    placeholder={hint}
                    onChange={(event) => patch(index, { [key]: event.target.value })}
                    className="min-h-11 w-full border border-line px-3"
                  />
                  {key === "accessedOn" ? (
                    <button type="button" className="min-h-11 shrink-0 border border-line px-3 text-xs font-bold" onClick={() => patch(index, { accessedOn: today() })}>
                      Today
                    </button>
                  ) : null}
                </div>
              </label>
            ))}
            <label className="text-sm font-semibold md:col-span-2">
              Claim this source supports
              <textarea
                value={source.claim}
                placeholder="The exact claim in your article that this source backs up"
                onChange={(event) => patch(index, { claim: event.target.value })}
                className="mt-1 min-h-20 w-full border border-line px-3 py-2"
              />
            </label>
          </div>
        </div>
      ))}
      <button type="button" className="mt-3 min-h-11 border border-line px-3 text-sm" onClick={add}>
        Add source
      </button>
    </section>
  );
}
