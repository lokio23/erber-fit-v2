import { useState } from 'react'
import { Check, X } from 'lucide-react'

const RPE_OPTIONS = [6, 7, 8, 9, 10]

export default function SetLogger({
  setNumber,
  targetRepsMin,
  targetRepsMax,
  lastWeight,
  lastReps,
  completedSet,
  isPR,
  onLog,
  onRemove,
  unit = 'lbs',
}) {
  const [weight, setWeight] = useState(completedSet?.weight?.toString() || lastWeight?.toString() || '')
  const [reps, setReps] = useState(completedSet?.reps?.toString() || lastReps?.toString() || '')
  const [rpe, setRpe] = useState(null)

  const isCompleted = !!completedSet

  const handleLog = () => {
    const w = Number(weight)
    const r = Number(reps)
    if (w < 0 || !r || r <= 0 || (weight === '' && !w)) return
    onLog(w, r, rpe)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLog()
  }

  if (isCompleted) {
    return (
      <div className={`flex items-center gap-3 py-2.5 px-3 rounded-lg bg-accent/5 border border-accent/10 ${isPR ? 'ring-1 ring-accent' : ''}`}>
        <span className="text-xs font-mono text-muted w-6 shrink-0">
          {setNumber}
        </span>
        <span className="text-sm font-mono text-text flex-1">
          {completedSet.weight === 0 ? 'BW' : `${completedSet.weight} ${unit}`} × {completedSet.reps}
        </span>
        {completedSet.rpe && (
          <span className="text-[10px] font-mono text-accent-secondary/80 bg-accent-secondary/10 px-1.5 py-0.5 rounded">
            RPE {completedSet.rpe}
          </span>
        )}
        {isPR && (
          <span className="text-[10px] font-mono font-bold text-bg bg-accent px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
            PR!
          </span>
        )}
        <button onClick={onRemove} className="text-muted hover:text-accent-secondary active:opacity-70 transition-colors p-2.5 -m-1" aria-label="Remove set">
          <X size={14} />
        </button>
        <Check size={16} className="text-accent shrink-0" />
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-card border border-border">
        <span className="text-xs font-mono text-muted w-6 shrink-0">
          {setNumber}
        </span>
        <div className="flex items-center gap-2 flex-1">
          <input
            type="number"
            inputMode="decimal"
            enterKeyHint="next"
            placeholder={lastWeight ? String(lastWeight) : unit}
            value={weight}
            onChange={e => setWeight(e.target.value)}
            aria-label={`Weight in ${unit}`}
            className="w-16 bg-bg border border-border rounded px-2 py-1.5 text-sm font-mono text-text placeholder:text-muted/50 focus:outline-none focus:border-accent/50 text-center"
          />
          <span className="text-muted text-xs">×</span>
          <input
            type="number"
            inputMode="numeric"
            enterKeyHint="done"
            placeholder={targetRepsMin === targetRepsMax ? String(targetRepsMin) : `${targetRepsMin}-${targetRepsMax}`}
            value={reps}
            onChange={e => setReps(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Reps"
            className="w-16 bg-bg border border-border rounded px-2 py-1.5 text-sm font-mono text-text placeholder:text-muted/50 focus:outline-none focus:border-accent/50 text-center"
          />
        </div>
        <button
          onClick={handleLog}
          disabled={weight === '' || !reps}
          className="p-2.5 rounded-md bg-accent/10 text-accent disabled:opacity-20 disabled:cursor-not-allowed hover:bg-accent/20 active:opacity-70 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Log set"
        >
          <Check size={16} />
        </button>
      </div>
      {/* RPE selector */}
      {weight !== '' && reps && (
        <div className="flex items-center gap-1.5 pl-9">
          <span className="text-[9px] font-mono text-muted/50 uppercase tracking-wider mr-1">RPE</span>
          {RPE_OPTIONS.map(val => (
            <button
              key={val}
              onClick={() => setRpe(rpe === val ? null : val)}
              className={`w-7 h-7 rounded-full text-[11px] font-mono transition-colors active:opacity-70 ${
                rpe === val
                  ? 'bg-accent-secondary/20 text-accent-secondary border border-accent-secondary/40'
                  : 'bg-bg border border-border text-muted hover:text-text'
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
