export function PublishDialog({ issues, onConfirm, onCancel }: { issues: number; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm border border-ink bg-card p-4" role="dialog" aria-label="Confirm publish">
        <p className="font-semibold">Publish this version to the public site?</p>
        <p className="mt-1 text-sm text-muted">Readers will see this headline, body, and source list.</p>
        {issues > 0 ? <p className="mt-2 text-sm text-accent">{issues} thing(s) still need fixing. Publishing may be blocked.</p> : null}
        <div className="mt-3 flex gap-2">
          <button type="button" className="min-h-11 bg-ink px-4 text-sm font-semibold text-inverse-fg" onClick={onConfirm}>
            Confirm publish
          </button>
          <button type="button" className="min-h-11 border border-line px-4 text-sm" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
