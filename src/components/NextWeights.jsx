import { useMemo } from 'react'
import { ArrowUp } from 'lucide-react'
import { useWorkout } from '../WorkoutContext'
import { getTodayStr } from '../utils/calculations'
import { DEFAULT_STEP, recommend, exerciseHistory, describe, unlockProgress } from '../utils/progression'

const ROTATION = ['friday', 'saturday', 'sunday', 'monday', 'tuesday', 'wednesday']

const fmt = n => String(Math.round(n * 10) / 10)

// Where every lift stands against its next weight: which are due to go up, how far
// the rest are from unlocking, and which need a second look. With `workoutKeys` it
// covers just those workouts, in program order — the plan for the session about to
// start. Without, it covers the whole program, closest-to-unlocking first.
export default function NextWeights({ workoutKeys, compact = false }) {
  const { program, sessions, settings } = useWorkout()
  const unit = settings.unit

  const rows = useMemo(() => {
    const today = getTodayStr()
    const byId = new Map()
    for (const dayKey of workoutKeys || ROTATION) {
      const day = program[dayKey]
      if (!day) continue
      for (const exercise of day.exercises || []) {
        // The same lift on two days shares one history, so it gets one row.
        const existing = byId.get(exercise.id)
        if (existing) {
          if (!existing.workouts.includes(day.name)) existing.workouts.push(day.name)
          continue
        }
        const rec = recommend(
          exercise,
          exerciseHistory(sessions, exercise.id, exercise.name),
          { step: settings.weightSteps?.[exercise.id] ?? DEFAULT_STEP, bodyweight: settings.bodyweight, today },
        )
        if (rec.status === 'untracked') continue
        byId.set(exercise.id, {
          id: exercise.id,
          name: exercise.name,
          workouts: [day.name],
          rec,
          progress: unlockProgress(rec),
        })
      }
    }
    return [...byId.values()]
  }, [program, sessions, settings.weightSteps, settings.bodyweight, workoutKeys])

  const ready = rows.filter(r => r.rec.status === 'increase')
  const check = rows.filter(r => ['drop', 'layoff', 'hold'].includes(r.rec.status) || r.rec.stalled)
  const building = rows.filter(r => r.rec.status === 'build' && !r.rec.stalled)
  const fresh = rows.filter(r => r.rec.status === 'no_data')

  if (rows.length === 0) return null

  const summary = [
    ready.length > 0 && `${ready.length} ready for more weight`,
    building.length > 0 && `${building.length} building reps`,
    check.length > 0 && `${check.length} to check`,
  ].filter(Boolean).join(' · ')

  // The session plan keeps program order; the overview sorts by what is closest.
  const ordered = compact
    ? rows
    : [
        ...ready,
        ...check,
        ...[...building].sort((a, b) => (b.progress?.fraction ?? 0) - (a.progress?.fraction ?? 0)),
        ...fresh,
      ]

  const w = n => (n === 0 ? 'BW' : `${fmt(n)} ${unit}`)

  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3.5">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <p className="text-[10px] font-mono text-muted uppercase tracking-wider shrink-0">
          {compact ? 'Today’s plan' : 'Next weights'}
        </p>
        <p className="text-[10px] font-mono text-muted/70 text-right">{summary}</p>
      </div>

      <div className="space-y-1.5">
        {ordered.map(row => (
          <Row key={row.id} row={row} w={w} showWorkouts={!compact} unit={unit} />
        ))}
      </div>
    </div>
  )
}

function Row({ row, w, showWorkouts, unit }) {
  const { rec, progress } = row
  const isReady = rec.status === 'increase'
  const needsCheck = ['drop', 'layoff', 'hold'].includes(rec.status) || rec.stalled

  let right = null
  let sub = null

  if (isReady) {
    right = (
      <p className="text-xs font-mono font-bold text-accent flex items-center gap-1 justify-end">
        <ArrowUp size={12} />
        {w(rec.weight)}
      </p>
    )
    sub = `Up from ${w(rec.last.weight)} · aim for ${rec.goals[0]}+ reps`
  } else if (rec.status === 'no_data') {
    right = <p className="text-[10px] font-mono text-muted/60">Not logged yet</p>
  } else if (needsCheck) {
    const text = describe(rec, unit)
    right = <p className="text-xs font-mono text-accent-secondary/90">{w(rec.weight)}</p>
    sub = rec.stalled ? text.detail : text.headline
  } else {
    right = <p className="text-xs font-mono text-text">{w(rec.weight)}</p>
    sub = rec.incomplete
      ? `${progress.setsToGo} more set${progress.setsToGo === 1 ? '' : 's'} at this weight unlocks ${w(rec.nextWeight)}`
      : rec.nextWeight != null
        ? `${progress.repsToGo} rep${progress.repsToGo === 1 ? '' : 's'} to unlock ${w(rec.nextWeight)} · goal ${rec.goals.join(' · ')}`
        : `Goal ${rec.goals.join(' · ')}`
  }

  return (
    <div className={`bg-bg border rounded-lg px-3 py-2.5 ${isReady ? 'border-accent/25' : needsCheck ? 'border-accent-secondary/20' : 'border-border'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-body font-medium text-text truncate">{row.name}</p>
          {showWorkouts && (
            <p className="text-[9px] font-mono text-muted/50 uppercase tracking-wider mt-0.5">{row.workouts.join(' · ')}</p>
          )}
        </div>
        <div className="shrink-0 text-right">{right}</div>
      </div>
      {sub && (
        <p className={`text-[10px] font-mono leading-snug mt-1 ${needsCheck ? 'text-accent-secondary/70' : 'text-muted'}`}>{sub}</p>
      )}
      {progress && !rec.stalled && rec.nextWeight != null && (
        <div className="h-1 rounded-full overflow-hidden mt-2" style={{ background: '#1a1c1e' }} role="progressbar" aria-valuenow={Math.round(progress.fraction * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={`Progress to ${w(rec.nextWeight)}`}>
          <div className="h-full rounded-full" style={{ width: `${Math.round(progress.fraction * 100)}%`, background: 'linear-gradient(to right, #b8cc30, #e8ff47)' }} />
        </div>
      )}
    </div>
  )
}
