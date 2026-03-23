import { useState, useMemo, useEffect, useRef } from 'react'
import { MessageSquare } from 'lucide-react'
import SetLogger from './SetLogger'
import FormGuide from './FormGuide'
import { useWorkout } from '../WorkoutContext'
import { formatRepRange, formatRestTime, findPR, isWeightStagnant, getLastSessionWeight } from '../utils/calculations'

let stylesInjected = false
function injectAnimationStyles() {
  if (stylesInjected) return
  stylesInjected = true
  const style = document.createElement('style')
  style.textContent = `
    @keyframes electric-glow {
      0% { box-shadow: 0 0 0 0 #e8ff47; border-color: #e8ff47; }
      10% { box-shadow: 0 0 20px 4px #e8ff47, 0 0 40px 8px rgba(232,255,71,0.3); border-color: #fff; }
      20% { box-shadow: 0 0 5px 1px #e8ff47; border-color: #e8ff47; }
      35% { box-shadow: 0 0 25px 6px #e8ff47, 0 0 60px 12px rgba(232,255,71,0.25); border-color: #fff; }
      50% { box-shadow: 0 0 8px 2px #e8ff47; border-color: #e8ff47; }
      65% { box-shadow: 0 0 15px 3px #e8ff47, 0 0 30px 6px rgba(232,255,71,0.15); }
      100% { box-shadow: 0 0 0 0 transparent; border-color: rgba(232,255,71,0.2); }
    }
    @keyframes card-flash {
      0% { opacity: 0.25; }
      100% { opacity: 0; }
    }
    @keyframes spark-burst {
      0% { opacity: 1; transform: translate(0, 0) scale(1); }
      60% { opacity: 0.8; }
      100% { opacity: 0; transform: translate(var(--sx), var(--sy)) scale(0); }
    }
    .animate-electric-glow { animation: electric-glow 1.4s ease-out forwards; }
    .animate-card-flash { animation: card-flash 0.6s ease-out forwards; }
    .spark {
      position: absolute; width: 4px; height: 4px; border-radius: 50%;
      background: #e8ff47; animation: spark-burst 0.8s ease-out forwards;
      pointer-events: none;
    }
  `
  document.head.appendChild(style)
}

// Inject animation styles once at module load (not inside render)
injectAnimationStyles()

export default function ExerciseCard({ exercise, sessionExercise, sessionId, onSetLogged, readOnly, isWarmup }) {
  const { sessions, settings, logSet, updateExerciseNotes, removeSet } = useWorkout()
  const [showNotes, setShowNotes] = useState(!!sessionExercise?.notes)

  const lastWeight = useMemo(
    () => (readOnly || isWarmup) ? null : getLastSessionWeight(sessions.slice(0, -1), exercise.id),
    [sessions, exercise.id, readOnly, isWarmup]
  )

  const currentPR = useMemo(
    () => (readOnly || isWarmup) ? null : findPR(sessions, exercise.id),
    [sessions, exercise.id, readOnly, isWarmup]
  )

  const needsOverload = useMemo(
    () => (readOnly || isWarmup) ? false : isWeightStagnant(sessions, exercise.id),
    [sessions, exercise.id, readOnly, isWarmup]
  )

  const completedSets = sessionExercise?.sets || []
  const targetSets = exercise.sets

  const handleLogSet = (weight, reps) => {
    logSet(sessionId, exercise.id, weight, reps, !!isWarmup)
    if (onSetLogged) onSetLogged(exercise.restSeconds)
  }

  const handleRemoveSet = (index) => {
    removeSet(sessionId, exercise.id, index, !!isWarmup)
  }

  const isPRSet = (set) => {
    if (!currentPR) return false
    return set.weight > currentPR.weight || (set.weight === currentPR.weight && set.reps > currentPR.reps)
  }

  const allSetsComplete = !readOnly && !isWarmup && completedSets.length >= targetSets

  // Detect the moment all sets become complete (not on mount)
  const prevCompleteRef = useRef(allSetsComplete)
  const [justCompleted, setJustCompleted] = useState(false)

  useEffect(() => {
    if (allSetsComplete && !prevCompleteRef.current) {
      setJustCompleted(true)
      const timer = setTimeout(() => setJustCompleted(false), 1500)
      return () => clearTimeout(timer)
    }
    prevCompleteRef.current = allSetsComplete
  }, [allSetsComplete])

  // Spark positions — 8 particles bursting from edges
  const sparks = [
    { sx: '-30px', sy: '-25px', delay: '0s' },
    { sx: '30px', sy: '-20px', delay: '0.05s' },
    { sx: '-25px', sy: '20px', delay: '0.1s' },
    { sx: '35px', sy: '25px', delay: '0.08s' },
    { sx: '-15px', sy: '-35px', delay: '0.12s' },
    { sx: '20px', sy: '30px', delay: '0.03s' },
    { sx: '-35px', sy: '5px', delay: '0.07s' },
    { sx: '30px', sy: '-10px', delay: '0.11s' },
  ]

  return (
    <div className={`relative rounded-xl border transition-colors ${
      justCompleted ? 'animate-electric-glow' : ''
    } ${allSetsComplete ? 'bg-card/50 border-accent/20' : 'bg-card border-border'}`}
      style={allSetsComplete && !justCompleted ? { boxShadow: '0 0 0 1px rgba(232,255,71,0.08), inset 0 1px 0 rgba(232,255,71,0.06)', background: 'linear-gradient(145deg, rgba(232,255,71,0.04), rgba(22,24,25,0.5) 60%)' } : undefined}>
      {/* Flash overlay */}
      {justCompleted && (
        <div className="absolute inset-0 rounded-xl bg-accent animate-card-flash pointer-events-none z-10" />
      )}
      {/* Spark particles */}
      {justCompleted && sparks.map((s, i) => (
        <span
          key={i}
          className="spark z-20"
          style={{
            top: '50%',
            left: '50%',
            '--sx': s.sx,
            '--sy': s.sy,
            animationDelay: s.delay,
          }}
        />
      ))}
      {/* Header */}
      <div className={`px-4 pt-4 ${readOnly ? 'pb-3' : 'pb-2'}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-body text-sm font-semibold text-text leading-tight">
              {exercise.name}
            </h3>
            <p className="text-xs font-mono text-muted mt-1">
              {exercise.sets}×{formatRepRange(exercise.repsMin, exercise.repsMax)} · {formatRestTime(exercise.restSeconds)} rest
            </p>
          </div>
          {!readOnly && (
            <div className="text-[10px] font-mono text-accent/60 bg-accent/5 px-2 py-0.5 rounded-full">
              {completedSets.length}/{targetSets}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {isWarmup ? (
            <span className="text-[10px] font-mono text-blue-400/70 bg-blue-400/5 px-2 py-0.5 rounded">
              Light weight — focus on form
            </span>
          ) : (
            <>
              <span className="text-[10px] font-mono text-muted/70 bg-bg px-2 py-0.5 rounded">
                Stop 1-2 reps before failure
              </span>
              {exercise.isCompound && exercise.restSeconds >= 180 && (
                <span className="text-[10px] font-mono text-accent-secondary/70 bg-accent-secondary/5 px-2 py-0.5 rounded">
                  Full rest — do not skip
                </span>
              )}
            </>
          )}
        </div>

        {/* Progressive overload nudge */}
        {!readOnly && needsOverload && !allSetsComplete && (
          <div className="mt-2.5 px-2.5 py-1.5 rounded-md bg-accent/10 border border-accent/20">
            <p className="text-[11px] font-mono text-accent">
              Time to add weight
            </p>
          </div>
        )}
      </div>

      {/* Set rows — only in interactive mode */}
      {!readOnly && (
        <div className="px-4 pb-3 space-y-1.5">
          {Array.from({ length: Math.max(targetSets, completedSets.length + (allSetsComplete ? 0 : 1)) }, (_, i) => {
            const completed = completedSets[i]
            if (i >= targetSets && !completed) return null
            return (
              <SetLogger
                key={i}
                setNumber={i + 1}
                targetRepsMin={exercise.repsMin}
                targetRepsMax={exercise.repsMax}
                lastWeight={lastWeight}
                completedSet={completed}
                isPR={completed ? isPRSet(completed) : false}
                onLog={(weight, reps) => handleLogSet(weight, reps)}
                onRemove={() => handleRemoveSet(i)}
                unit={settings.unit}
              />
            )
          })}
        </div>
      )}

      {/* Notes + Form Guide */}
      <div className="px-4 pb-4 flex items-start gap-3">
        <div className="flex-1">
          {exercise.isBuiltIn && <FormGuide exerciseId={exercise.id} />}
        </div>
        {!readOnly && (
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`p-1.5 rounded transition-colors ${showNotes ? 'text-accent' : 'text-muted hover:text-text'}`}
          >
            <MessageSquare size={14} />
          </button>
        )}
      </div>

      {!readOnly && showNotes && (
        <div className="px-4 pb-4 -mt-2">
          <textarea
            value={sessionExercise?.notes || ''}
            onChange={e => updateExerciseNotes(sessionId, exercise.id, e.target.value, !!isWarmup)}
            placeholder="Add notes..."
            rows={2}
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-xs font-mono text-text placeholder:text-muted/40 focus:outline-none focus:border-accent/30 resize-none"
          />
        </div>
      )}
    </div>
  )
}
