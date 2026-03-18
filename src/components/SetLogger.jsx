import { useState } from 'react'
import { Check, X } from 'lucide-react'

export default function SetLogger({
  setNumber,
  targetRepsMin,
  targetRepsMax,
  lastWeight,
  completedSet,
  isPR,
  onLog,
  onRemove,
}) {
  const [weight, setWeight] = useState(completedSet?.weight?.toString() || lastWeight?.toString() || '')
  const [reps, setReps] = useState(completedSet?.reps?.toString() || '')

  const isCompleted = !!completedSet

  const handleLog = () => {
    if (!weight || !reps) return
    onLog(Number(weight), Number(reps))
    // Don't reset - keep values visible
  }

  if (isCompleted) {
    return (
      <div className={`flex items-center gap-3 py-2.5 px-3 rounded-lg bg-accent/5 border border-accent/10 ${isPR ? 'ring-1 ring-accent' : ''}`}>
        <span className="text-xs font-mono text-muted w-6 shrink-0">
          {setNumber}
        </span>
        <span className="text-sm font-mono text-text flex-1">
          {completedSet.weight} lbs × {completedSet.reps}
        </span>
        {isPR && (
          <span className="text-[10px] font-mono font-bold text-bg bg-accent px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
            PR!
          </span>
        )}
        <button onClick={onRemove} className="text-muted hover:text-accent-secondary transition-colors p-1">
          <X size={14} />
        </button>
        <Check size={16} className="text-accent shrink-0" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-card border border-border">
      <span className="text-xs font-mono text-muted w-6 shrink-0">
        {setNumber}
      </span>
      <div className="flex items-center gap-2 flex-1">
        <input
          type="number"
          inputMode="decimal"
          placeholder={lastWeight ? String(lastWeight) : 'lbs'}
          value={weight}
          onChange={e => setWeight(e.target.value)}
          className="w-16 bg-bg border border-border rounded px-2 py-1.5 text-sm font-mono text-text placeholder:text-muted/50 focus:outline-none focus:border-accent/50 text-center"
        />
        <span className="text-muted text-xs">×</span>
        <input
          type="number"
          inputMode="numeric"
          placeholder={targetRepsMin === targetRepsMax ? String(targetRepsMin) : `${targetRepsMin}-${targetRepsMax}`}
          value={reps}
          onChange={e => setReps(e.target.value)}
          className="w-16 bg-bg border border-border rounded px-2 py-1.5 text-sm font-mono text-text placeholder:text-muted/50 focus:outline-none focus:border-accent/50 text-center"
        />
      </div>
      <button
        onClick={handleLog}
        disabled={!weight || !reps}
        className="p-1.5 rounded-md bg-accent/10 text-accent disabled:opacity-20 disabled:cursor-not-allowed hover:bg-accent/20 transition-colors"
      >
        <Check size={16} />
      </button>
    </div>
  )
}
