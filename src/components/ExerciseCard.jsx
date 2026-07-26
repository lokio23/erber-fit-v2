import { useState, useMemo, useEffect, useRef } from 'react'
import { Minus, Plus, Check, RotateCcw } from 'lucide-react'
import SetLogger from './SetLogger'
import FormGuide from './FormGuide'
import { getLoadNote } from '../data/loadConventions'
import { useWorkout } from '../WorkoutContext'
import { formatRepRange, formatRestTime, findPR, getLastSessionSets, getProgressionRecommendation, calcEstimated1RM } from '../utils/calculations'

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

const fmtWeight = (n) => String(Math.round(n * 10) / 10)

export default function ExerciseCard({ exercise, sessionExercise, sessionId, onSetLogged, readOnly, isWarmup }) {
  const { sessions, settings, logSet, logSets, clearSets, removeSet } = useWorkout()

  const pastSessions = useMemo(
    () => (sessionId ? sessions.filter(s => s.id !== sessionId) : sessions),
    [sessions, sessionId]
  )

  const lastSets = useMemo(
    () => (readOnly || isWarmup) ? [] : getLastSessionSets(pastSessions, exercise.id, exercise.name),
    [pastSessions, exercise.id, exercise.name, readOnly, isWarmup]
  )

  // Baseline excludes the live session — comparing a set against a PR that
  // already includes that set made the PR badge unreachable.
  const currentPR = useMemo(
    () => (readOnly || isWarmup) ? null : findPR(pastSessions, exercise.id),
    [pastSessions, exercise.id, readOnly, isWarmup]
  )

  const progression = useMemo(() => {
    if (readOnly || isWarmup) return null
    return getProgressionRecommendation(
      pastSessions, exercise.id, exercise.name,
      exercise.repsMax, exercise.isCompound, settings.unit,
    )
  }, [pastSessions, exercise.id, exercise.name, exercise.repsMax, exercise.isCompound,
      settings.unit, readOnly, isWarmup])

  const completedSets = sessionExercise?.sets || []
  const targetSets = exercise.sets
  const loadNote = getLoadNote(exercise)

  // Straight sets: one weight for the whole exercise. Suggested progression wins,
  // otherwise repeat last session's weight.
  const suggestedWeight = progression?.reason === 'increase' ? progression.suggestedWeight : null
  const prefillWeight = suggestedWeight ?? lastSets[0]?.weight ?? null

  const [weight, setWeight] = useState(prefillWeight != null ? fmtWeight(prefillWeight) : '')
  const weightEdited = useRef(false)

  // Once a set is logged, that weight is the truth for the rest of the exercise.
  const loggedWeight = completedSets.length > 0 ? completedSets[completedSets.length - 1].weight : null

  useEffect(() => {
    if (loggedWeight != null) {
      setWeight(fmtWeight(loggedWeight))
      return
    }
    if (weightEdited.current) return
    setWeight(prefillWeight != null ? fmtWeight(prefillWeight) : '')
  }, [loggedWeight, prefillWeight])

  const step = exercise.isCompound ? 5 : 2.5

  const adjustWeight = (delta) => {
    weightEdited.current = true
    setWeight(fmtWeight(Math.max(0, (Number(weight) || 0) + delta)))
  }

  const weightSet = weight !== '' && !Number.isNaN(Number(weight))

  const handleLogSet = (reps, rpe) => {
    logSet(sessionId, exercise.id, Number(weight) || 0, reps, rpe, !!isWarmup)
    if (onSetLogged) onSetLogged(exercise.restSeconds)
  }

  const handleRemoveSet = (index) => {
    removeSet(sessionId, exercise.id, index, !!isWarmup)
  }

  // Warm-ups are a single tick — they feed no metric, so weight and reps are noise.
  const warmupDone = isWarmup && completedSets.length > 0
  const markWarmupDone = () => {
    logSets(
      sessionId,
      exercise.id,
      Array.from({ length: targetSets }, () => ({ weight: 0, reps: exercise.repsMin })),
      true,
    )
  }

  const isPRSet = (set) => {
    if (!currentPR) return false
    return calcEstimated1RM(set.weight, set.reps) > calcEstimated1RM(currentPR.weight, currentPR.reps)
  }

  // Reps carry forward from the previous set of this exercise, then from last
  // session, then from the top of the target range.
  const lastLogged = completedSets[completedSets.length - 1]
  const prefillRepsFor = (i) => {
    if (lastLogged) return lastLogged.reps
    return lastSets[i]?.reps ?? lastSets[0]?.reps ?? exercise.repsMax
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

  const showWarmupTick = isWarmup && !readOnly && sessionId

  return (
    <div className={`relative rounded-xl border transition-colors ${
      justCompleted ? 'animate-electric-glow' : ''
    } ${allSetsComplete || warmupDone ? 'bg-card/50 border-accent/20' : 'bg-card border-border'}`}
      style={(allSetsComplete || warmupDone) && !justCompleted ? { boxShadow: '0 0 0 1px rgba(232,255,71,0.08), inset 0 1px 0 rgba(232,255,71,0.06)', background: 'linear-gradient(145deg, rgba(232,255,71,0.04), rgba(22,24,25,0.5) 60%)' } : undefined}>
      {/* Flash overlay */}
      {justCompleted && (
        <div className="absolute inset-0 rounded-xl bg-accent animate-card-flash pointer-events-none z-10" />
      )}
      {/* Spark particles */}
      {justCompleted && sparks.map((s, i) => (
        <span
          key={i}
          className="spark z-20"
          style={{ top: '50%', left: '50%', '--sx': s.sx, '--sy': s.sy, animationDelay: s.delay }}
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
              {exercise.sets}×{formatRepRange(exercise.repsMin, exercise.repsMax)}
              {isWarmup ? '' : ` · ${formatRestTime(exercise.restSeconds)} rest`}
            </p>
          </div>
          {!readOnly && !isWarmup && (
            <div className="text-[10px] font-mono text-accent/60 bg-accent/5 px-2 py-0.5 rounded-full">
              {completedSets.length}/{targetSets}
            </div>
          )}
        </div>

        {/* Tags */}
        {!isWarmup && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            <span className="text-[10px] font-mono text-muted/70 bg-bg px-2 py-0.5 rounded">
              Stop 1-2 reps before failure
            </span>
            {exercise.isCompound && exercise.restSeconds >= 180 && (
              <span className="text-[10px] font-mono text-accent-secondary/70 bg-accent-secondary/5 px-2 py-0.5 rounded">
                Full rest — do not skip
              </span>
            )}
          </div>
        )}

        {/* Progressive overload nudge */}
        {!readOnly && !isWarmup && progression && !allSetsComplete && (
          progression.reason === 'increase' ? (
            <div className="mt-2.5 px-2.5 py-1.5 rounded-md bg-accent/10 border border-accent/20">
              <p className="text-[11px] font-mono text-accent leading-snug">
                Increase weight — try{' '}
                <span className="font-bold">{fmtWeight(progression.suggestedWeight)} {settings.unit}</span>
              </p>
            </div>
          ) : progression.reason === 'keep_pushing' ? (
            <div className="mt-2.5 px-2.5 py-1.5 rounded-md bg-bg border border-border/60">
              <p className="text-[11px] font-mono text-muted leading-snug">
                Hit {exercise.repsMax} reps on all sets to unlock next weight
              </p>
            </div>
          ) : null
        )}
      </div>

      {/* Warm-up: one tick for the whole exercise */}
      {showWarmupTick && (
        <div className="px-4 pb-4">
          {warmupDone ? (
            <button
              onClick={() => clearSets(sessionId, exercise.id, true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-xs font-mono uppercase tracking-wider active:opacity-70 transition-colors"
            >
              <Check size={14} /> Done
              <RotateCcw size={11} className="text-accent/50 ml-1" />
            </button>
          ) : (
            <button
              onClick={markWarmupDone}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-bg border border-blue-400/25 text-blue-400/80 text-xs font-mono uppercase tracking-wider hover:bg-blue-400/5 active:opacity-70 transition-colors"
            >
              Mark Done
            </button>
          )}
        </div>
      )}

      {/* Working sets: one weight for the exercise, then a row per set */}
      {!readOnly && !isWarmup && (
        <>
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-bg border border-border">
              <span className="text-[9px] font-mono text-muted/50 uppercase tracking-wider shrink-0">Weight</span>
              <button
                onClick={() => adjustWeight(-step)}
                className="w-9 h-9 rounded-md bg-card border border-border text-muted hover:text-text active:opacity-70 flex items-center justify-center shrink-0"
                aria-label={`Reduce weight by ${step}`}
              >
                <Minus size={13} />
              </button>
              <input
                type="number"
                inputMode="decimal"
                value={weight}
                onChange={e => { weightEdited.current = true; setWeight(e.target.value) }}
                placeholder={settings.unit}
                aria-label={`Weight in ${settings.unit}`}
                className="w-16 bg-card border border-border rounded px-1 py-1.5 text-sm font-mono text-text placeholder:text-muted/50 focus:outline-none focus:border-accent/50 text-center"
              />
              <button
                onClick={() => adjustWeight(step)}
                className="w-9 h-9 rounded-md bg-card border border-border text-muted hover:text-text active:opacity-70 flex items-center justify-center shrink-0"
                aria-label={`Increase weight by ${step}`}
              >
                <Plus size={13} />
              </button>
              <span className="text-[10px] font-mono text-muted/60 shrink-0">
                {Number(weight) === 0 && weight !== '' ? 'BW' : settings.unit}
              </span>
              <button
                onClick={() => { weightEdited.current = true; setWeight('0') }}
                className="ml-auto text-[9px] font-mono text-muted/40 hover:text-muted uppercase tracking-wider shrink-0"
              >
                Bodyweight
              </button>
            </div>

            {loadNote && (
              <p className="text-[10px] font-mono text-muted/40 mt-1.5 pl-1 leading-snug">
                {loadNote}
              </p>
            )}

            {lastSets.length > 0 && (
              <p className="text-[10px] font-mono text-muted/50 mt-1 pl-1">
                Last: {lastSets[0].weight === 0 ? 'BW' : `${fmtWeight(lastSets[0].weight)} ${settings.unit}`}
                {' · '}{lastSets.map(s => s.reps).join(', ')} reps
              </p>
            )}
          </div>

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
                  prefillReps={prefillRepsFor(i)}
                  completedSet={completed}
                  isPR={completed ? isPRSet(completed) : false}
                  onLog={(reps, rpe) => handleLogSet(reps, rpe)}
                  onRemove={() => handleRemoveSet(i)}
                  disabled={!weightSet}
                  unit={settings.unit}
                />
              )
            })}
            {!weightSet && (
              <p className="text-[10px] font-mono text-muted/50 pl-1 pt-0.5">Set a weight to start logging</p>
            )}
          </div>
        </>
      )}

      {/* Form guide */}
      {exercise.isBuiltIn && (
        <div className="px-4 pb-4">
          <FormGuide exerciseId={exercise.id} />
        </div>
      )}
    </div>
  )
}
