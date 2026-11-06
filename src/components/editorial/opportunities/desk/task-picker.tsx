import { TASK_TYPES, type TaskType } from "@/lib/editorial/opportunity-types";
import { TASK_LABEL } from "../labels";

export function TaskPicker(props: {
  value: TaskType[];
  onChange: (next: TaskType[]) => void;
}) {
  const { value, onChange } = props;
  function toggle(t: TaskType) {
    const has = value.includes(t);
    onChange(has ? value.filter((x) => x !== t) : [...value, t]);
  }
  return (
    <fieldset className="md:col-span-2">
      <legend className="text-sm font-semibold">Task types</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {TASK_TYPES.map((t) => {
          const on = value.includes(t);
          const base = "min-h-11 border px-3 text-sm font-semibold ";
          const tone = on ? "border-ink bg-ink text-inverse-fg" : "border-line";
          return (
            <button
              key={t}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(t)}
              className={base + tone}
            >
              {TASK_LABEL[t]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
