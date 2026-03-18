export default function ConfirmDialog({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6" onClick={onCancel}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Dialog */}
      <div
        className="relative bg-card border border-border rounded-2xl px-5 py-5 w-full max-w-sm shadow-2xl shadow-black/80"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="font-display text-xl tracking-wider text-text">{title}</h3>
        <p className="text-sm text-muted mt-2 leading-relaxed">{message}</p>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg bg-bg border border-border text-sm font-mono text-muted hover:text-text active:opacity-70 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-lg text-sm font-mono active:opacity-70 transition-colors ${
              danger
                ? 'bg-accent-secondary/15 border border-accent-secondary/30 text-accent-secondary hover:bg-accent-secondary/25'
                : 'bg-accent/15 border border-accent/30 text-accent hover:bg-accent/25'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
