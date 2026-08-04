import { useState, useMemo } from 'react'
import { X, Lock } from 'lucide-react'
import { useWorkout } from '../WorkoutContext'
import { getSwapOptions } from '../utils/substitution'
import { displayWeight } from '../utils/calculations'

const DEMAND_LABEL = { low: 'easy to learn', medium: 'moderate technique', high: 'technical' }

function OptionRow({ option, selected, onSelect, unit }) {
  const last = option.lastSets[0]
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${
        selected ? 'border-accent/60 bg-accent/8' : 'border-border bg-bg hover:border-muted/40'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-body font-medium text-text">{option.name}</p>
        {option.neverTried ? (
          <span className="text-[10px] font-mono text-muted/50 shrink-0">never done</span>
        ) : (
          <span className="text-[10px] font-mono text-accent/80 shrink-0">
            last: {last.weight === 0 ? 'BW' : `${displayWeight(last.weight, unit)} ${unit}`} × {option.lastSets.map(s => s.reps).join(', ')}
          </span>
        )}
      </div>
      <p className="text-[10px] font-mono text-muted/60 mt-0.5">
        {option.equipment} · {DEMAND_LABEL[option.technicalDemand]}
        {option.note ? ` · ${option.note}` : ''}
      </p>
    </button>
  )
}

export default function SwapSheet({ exercise, sessionId, onClose }) {
  const { sessions, settings, swapExercise } = useWorkout()
  const [selectedId, setSelectedId] = useState(null)

  const options = useMemo(
    () => getSwapOptions(exercise.id, sessions),
    [exercise.id, sessions]
  )

  const allOptions = options ? [...options.equivalent, ...options.shiftsEmphasis] : []
  const selected = allOptions.find(o => o.id === selectedId) || null

  const applySwap = (permanent) => {
    if (!selected) return
    swapExercise(sessionId, exercise.id, selected, { permanent })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative w-full max-w-md bg-card border-t border-border rounded-t-2xl px-4 pt-4 pb-6 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[10px] font-mono text-muted uppercase tracking-widest">Swap Exercise</p>
            <h3 className="font-display text-2xl tracking-wider text-text mt-0.5">{exercise.name}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-muted hover:text-text" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {options?.locked ? (
          <div className="px-3 py-4 rounded-lg bg-bg border border-border flex items-start gap-3">
            <Lock size={16} className="text-accent-secondary shrink-0 mt-0.5" />
            <p className="text-[11px] font-mono text-muted leading-relaxed">
              This is one of your main lifts. Adding weight to it week after week is where
              your progress comes from — swapping it resets that. Change it in the program
              editor if you really want to.
            </p>
          </div>
        ) : !options || allOptions.length === 0 ? (
          <p className="text-[11px] font-mono text-muted px-1 py-4">
            No vetted substitutes for this exercise yet.
          </p>
        ) : (
          <>
            {options.equivalent.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] font-mono text-accent/80 uppercase tracking-widest mb-1.5">
                  Equivalent — same job, same emphasis
                </p>
                <div className="space-y-1.5">
                  {options.equivalent.map(o => (
                    <OptionRow key={o.id} option={o} selected={selectedId === o.id}
                      onSelect={() => setSelectedId(o.id)} unit={settings.unit} />
                  ))}
                </div>
              </div>
            )}

            {options.shiftsEmphasis.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] font-mono text-accent-secondary/80 uppercase tracking-widest mb-1.5">
                  Shifts emphasis — read before picking
                </p>
                <div className="space-y-1.5">
                  {options.shiftsEmphasis.map(o => (
                    <OptionRow key={o.id} option={o} selected={selectedId === o.id}
                      onSelect={() => setSelectedId(o.id)} unit={settings.unit} />
                  ))}
                </div>
              </div>
            )}

            {options.why && (
              <p className="text-[10px] font-mono text-muted/60 leading-relaxed px-1 mb-4">
                Why these: {options.why}
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => applySwap(false)}
                disabled={!selected}
                className={`flex-1 py-2.5 rounded-lg border text-xs font-mono uppercase tracking-wider transition-colors ${
                  selected ? 'border-accent/40 text-accent active:opacity-70' : 'border-border text-muted/40'
                }`}
              >
                Just today
              </button>
              <button
                onClick={() => applySwap(true)}
                disabled={!selected}
                className={`flex-1 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                  selected ? 'text-bg active:scale-[0.98]' : 'bg-border text-muted/40'
                }`}
                style={selected ? { background: 'linear-gradient(135deg, #c8e040, #e8ff47)' } : undefined}
              >
                Replace in program
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
