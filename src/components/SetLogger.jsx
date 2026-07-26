import { useState, useEffect, useRef } from 'react'
import { Check, X, Minus, Plus } from 'lucide-react'

const RPE_OPTIONS = [6, 7, 8, 9, 10]

export default function SetLogger({
  setNumber,
  targetRepsMin,
  targetRepsMax,
  prefillReps,
  completedSet,
  isPR,
  onLog,
  onRemove,
  disabled,
  unit = 'lbs',
}) {
  const [reps, setReps] = useState(prefillReps != null ? String(prefillReps) : '')
  const [rpe, setRpe] = useState(null)
  const [showRpe, setShowRpe] = useState(false)
  const edited = useRef(false)

  // Follow the prefill until the user types their own number. Without this the
  // row keeps whatever value it mounted with, which is what made every set of an
  // exercise need re-entering.
  useEffect(() => {
    if (edited.current) return
    setReps(prefillReps != null ? String(prefillReps) : '')
  }, [prefillReps])

  if (completedSet) {
    return (
      <div className={`flex items-center gap-3 py-2.5 px-3 rounded-lg bg-accent/5 border border-accent/10 ${isPR ? 'ring-1 ring-accent' : ''}`}>
        <span className="text-xs font-mono text-muted w-6 shrink-0">{setNumber}</span>
        <span className="text-sm font-mono text-text flex-1">
          {completedSet.weight === 0 ? 'BW' : `${completedSet.weight} ${unit}`} × {completedSet.reps}
        </span>
        {completedSet.rpe && (
          <span className="text-[10px] font-mono text-accent-secondary/80 bg-accent-secondary/10 px-1.5 py-0.5 rounded">
            RPE {completedSet.rpe}
          </span>
        )}
        {isPR && (
          <span className="text-[10px] font-mono font-bold text-bg bg-accent px-1.5 py-0.5 rounded uppercase tracking-wider">
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

  const repCount = Number(reps)
  const canLog = !disabled && repCount > 0

  const adjustReps = (delta) => {
    edited.current = true
    setReps(String(Math.max(0, (Number(reps) || 0) + delta)))
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-card border border-border">
        <span className="text-xs font-mono text-muted w-5 shrink-0">{setNumber}</span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => adjustReps(-1)}
            className="w-9 h-9 rounded-md bg-bg border border-border text-muted hover:text-text active:opacity-70 flex items-center justify-center shrink-0"
            aria-label="One less rep"
          >
            <Minus size={13} />
          </button>
          <input
            type="number"
            inputMode="numeric"
            value={reps}
            onChange={e => { edited.current = true; setReps(e.target.value) }}
            onKeyDown={e => { if (e.key === 'Enter' && canLog) onLog(repCount, rpe) }}
            placeholder={targetRepsMin === targetRepsMax ? String(targetRepsMin) : `${targetRepsMin}-${targetRepsMax}`}
            aria-label="Reps"
            className="w-12 bg-bg border border-border rounded px-1 py-1.5 text-sm font-mono text-text placeholder:text-muted/50 focus:outline-none focus:border-accent/50 text-center"
          />
          <button
            onClick={() => adjustReps(1)}
            className="w-9 h-9 rounded-md bg-bg border border-border text-muted hover:text-text active:opacity-70 flex items-center justify-center shrink-0"
            aria-label="One more rep"
          >
            <Plus size={13} />
          </button>
        </div>

        <span className="text-[10px] font-mono text-muted/50 shrink-0">reps</span>

        {!showRpe && (
          <button
            onClick={() => setShowRpe(true)}
            className="text-[9px] font-mono text-muted/40 hover:text-muted uppercase tracking-wider px-1 shrink-0"
          >
            RPE
          </button>
        )}

        <button
          onClick={() => onLog(repCount, rpe)}
          disabled={!canLog}
          className="ml-auto flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-md bg-accent/10 text-accent text-xs font-mono uppercase tracking-wider disabled:opacity-20 disabled:cursor-not-allowed hover:bg-accent/20 active:opacity-70 transition-colors shrink-0"
          aria-label="Log set"
        >
          <Check size={15} />
          Log
        </button>
      </div>

      {showRpe && (
        <div className="flex items-center gap-1.5 pl-8">
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
