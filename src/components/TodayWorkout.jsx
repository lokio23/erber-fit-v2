import { useState, useMemo, useCallback, useEffect } from 'react'
import { Coffee, Pencil, AlertTriangle, CheckCircle2, XCircle, Trophy, Zap } from 'lucide-react'
import ExerciseCard from './ExerciseCard'
import ProgramEditor from './ProgramEditor'
import ConfirmDialog from './ConfirmDialog'
import { useWorkout } from '../WorkoutContext'
import { countCompletedSets, countTotalSets, getWeeksSinceDate, isDeloadActive, getDeloadSets, getTodayStr, formatDate } from '../utils/calculations'

const DAYS = [
  { key: 'monday', short: 'MON' },
  { key: 'tuesday', short: 'TUE' },
  { key: 'wednesday', short: 'WED' },
  { key: 'thursday', short: 'THU' },
  { key: 'friday', short: 'FRI' },
  { key: 'saturday', short: 'SAT' },
  { key: 'sunday', short: 'SUN' },
]

const DAY_LABELS = {
  sunday: 'SUNDAY', monday: 'MONDAY', tuesday: 'TUESDAY', wednesday: 'WEDNESDAY',
  thursday: 'THURSDAY', friday: 'FRIDAY', saturday: 'SATURDAY',
}

export default function TodayWorkout({ onStartTimer }) {
  const { program, sessions, settings, setSettings, getDayKey, getTodaysSession, startSession, completeSession, resumeSession, abortSession } = useWorkout()

  const todayKey = getDayKey()
  const [selectedDay, setSelectedDay] = useState(todayKey)
  const [editing, setEditing] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)

  const isToday = selectedDay === todayKey
  const workout = program[selectedDay]
  const isRestDay = workout.exercises.length === 0
  const deloadActive = isDeloadActive(settings)

  // Auto-expire deload week
  useEffect(() => {
    if (settings.deloadActiveUntil && !deloadActive) {
      setSettings(prev => ({ ...prev, deloadActiveUntil: null, lastDeloadDate: getTodayStr() }))
    }
  }, [deloadActive, settings.deloadActiveUntil, setSettings])

  // Apply deload: halve sets when active (warm-ups unaffected)
  const effectiveExercises = useMemo(() => {
    if (!deloadActive) return workout.exercises
    return workout.exercises.map(ex => ({ ...ex, sets: getDeloadSets(ex.sets) }))
  }, [workout.exercises, deloadActive])

  const effectiveWarmups = workout.warmupExercises || []

  const session = getTodaysSession()

  const showDeloadReminder = useMemo(() => {
    if (!isToday || !settings.deloadReminderEnabled || deloadActive) return false
    const firstDate = sessions[0]?.date
    const ref = settings.lastDeloadDate || firstDate
    return getWeeksSinceDate(ref) >= 6
  }, [settings, sessions, isToday, deloadActive])

  const totalSets = useMemo(
    () => countTotalSets(effectiveExercises),
    [effectiveExercises]
  )

  const completedSets = useMemo(
    () => session ? countCompletedSets(session) : 0,
    [session]
  )

  const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0

  const handleStartWorkout = useCallback(() => {
    startSession()
  }, [startSession])

  const handleSetLogged = useCallback((restSeconds) => {
    if (onStartTimer) onStartTimer(restSeconds)
  }, [onStartTimer])

  return (
    <div className="pb-6">
      {editing && <ProgramEditor dayKey={selectedDay} onClose={() => setEditing(false)} />}

      {/* Day tabs */}
      <div className="flex items-center justify-between px-3 pt-3 pb-1 border-b border-border">
        {DAYS.map(({ key, short }) => {
          const isSelected = selectedDay === key
          const isLive = todayKey === key
          return (
            <button
              key={key}
              onClick={() => setSelectedDay(key)}
              className={`relative flex flex-col items-center px-2 py-2.5 rounded-md transition-colors active:opacity-70 ${
                isSelected ? 'text-accent' : 'text-muted hover:text-text'
              }`}
            >
              <span className={`text-[11px] font-mono tracking-wider ${isSelected ? 'font-medium' : ''}`}>
                {short}
              </span>
              {/* Accent underline for selected */}
              {isSelected && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full" style={{ background: 'linear-gradient(to right, transparent, #e8ff47, transparent)', boxShadow: '0 0 6px rgba(232,255,71,0.8)' }} />
              )}
              {/* Dot for today (when not selected) */}
              {isLive && !isSelected && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent/50 rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      {/* Deload week active banner */}
      {deloadActive && (
        <div className="mx-4 mt-3 px-4 py-3 rounded-xl bg-accent-secondary/10 border border-accent-secondary/20 flex items-center gap-3">
          <Zap size={16} className="text-accent-secondary shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-body font-medium text-accent-secondary">Deload Week</p>
            <p className="text-[11px] font-mono text-muted mt-0.5">Sets halved — same weight, half volume</p>
          </div>
        </div>
      )}

      {/* Deload reminder — only when not already in deload */}
      {showDeloadReminder && (
        <div className="mx-4 mt-3 px-4 py-3 rounded-xl bg-accent-secondary/10 border border-accent-secondary/20 flex items-start gap-3">
          <AlertTriangle size={16} className="text-accent-secondary shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-body font-medium text-accent-secondary">Deload recommended</p>
            <p className="text-[11px] font-mono text-muted mt-0.5">Cut volume 50% this week — you'll come back stronger.</p>
          </div>
          <button
            onClick={() => {
              const end = new Date()
              end.setDate(end.getDate() + 7)
              setSettings(prev => ({ ...prev, deloadActiveUntil: end.toISOString().split('T')[0], lastDeloadDate: getTodayStr() }))
            }}
            className="text-[10px] font-mono text-accent-secondary underline shrink-0"
          >
            Start
          </button>
        </div>
      )}

      {/* Rest day */}
      {isRestDay && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-8 text-center">
          <Coffee size={48} className="text-muted/30 mb-6" />
          <h2 className="font-display text-4xl text-text tracking-wider mb-3">REST DAY</h2>
          <p className="text-sm text-muted leading-relaxed max-w-xs">
            Recovery is when growth happens. Come back stronger{isToday ? ' tomorrow' : ''}.
          </p>
        </div>
      )}

      {/* Workout content */}
      {!isRestDay && (
        <>
          {/* Workout header */}
          <div className="px-5 pt-4 pb-3">
            {/* Preview badge for non-today days */}
            {!isToday && (
              <p className="text-[10px] font-mono text-muted/50 uppercase tracking-widest mb-1">Preview</p>
            )}
            <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-1">{DAY_LABELS[selectedDay]}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-3">
                <h2 className="font-display text-3xl tracking-wider text-text">
                  {workout.name}
                </h2>
                <span className="text-xs font-mono text-muted uppercase tracking-wider">
                  {workout.focus}
                </span>
              </div>
              <button
                onClick={() => setEditing(true)}
                className="p-2 text-muted hover:text-accent transition-colors"
              >
                <Pencil size={16} />
              </button>
            </div>

            {/* Muscle group pills */}
            <div className="flex gap-1.5 mt-2">
              {workout.muscleGroups.map(group => (
                <span
                  key={group}
                  className="text-[10px] font-mono uppercase tracking-wider text-accent/80 bg-accent/8 border border-accent/15 px-2 py-0.5 rounded-full"
                >
                  {group}
                </span>
              ))}
            </div>

            {/* Progress bar — today only, with active session */}
            {isToday && session && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono text-muted">
                    {completedSets} of {totalSets} sets
                  </span>
                  <span className="text-[11px] font-mono text-accent">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1a1c1e', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%`, background: 'linear-gradient(to right, #b8cc30, #e8ff47, #f5ff80)', boxShadow: '0 0 8px rgba(232,255,71,0.6), 0 0 2px rgba(232,255,71,1)' }}
                  />
                </div>
              </div>
            )}

            {/* Start workout button — today only, no session yet */}
            {isToday && !session && (
              <button
                onClick={handleStartWorkout}
                className="mt-4 w-full py-3 rounded-lg text-bg font-display text-lg tracking-wider active:scale-[0.98] transition-all"
                style={{ background: 'linear-gradient(135deg, #c8e040, #e8ff47, #f0ff6a)', boxShadow: '0 0 16px rgba(232,255,71,0.25), 0 4px 12px rgba(0,0,0,0.4)' }}
              >
                START WORKOUT
              </button>
            )}
          </div>

          {/* Workout Complete banner */}
          {isToday && session?.completedAt && (
            <div className="mx-4 mb-3 px-4 py-4 rounded-xl border border-accent/30 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, rgba(232,255,71,0.12), rgba(232,255,71,0.04), transparent)', boxShadow: '0 0 20px rgba(232,255,71,0.08), inset 0 1px 0 rgba(232,255,71,0.1)' }}>
              <Trophy size={20} className="text-accent shrink-0" style={{ filter: 'drop-shadow(0 0 8px rgba(232,255,71,0.7))' }} />
              <div className="flex-1">
                <p className="text-sm font-display tracking-wider text-accent">WORKOUT COMPLETE</p>
                <p className="text-[11px] font-mono text-muted mt-0.5">
                  {completedSets} of {totalSets} sets logged
                </p>
              </div>
              <button
                onClick={() => resumeSession(session.id)}
                className="text-[10px] font-mono text-accent/70 underline shrink-0 active:opacity-70"
              >
                Resume
              </button>
            </div>
          )}

          {/* Warm-up section */}
          {effectiveWarmups.length > 0 && (
            <div className="px-4 mb-2">
              <div className="flex items-center gap-2 mb-2 mt-1">
                <span className="text-[10px] font-mono text-blue-400/80 uppercase tracking-widest">Warm-Up</span>
                <span className="text-[10px] font-mono text-muted/50">Light weight, full ROM</span>
              </div>
              <div className="space-y-2">
                {isToday && session ? (
                  effectiveWarmups.map(exercise => {
                    const sessionEx = (session.warmupExercises || []).find(e => e.exerciseId === exercise.id)
                    return (
                      <ExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        sessionExercise={sessionEx}
                        sessionId={session.id}
                        onSetLogged={handleSetLogged}
                        readOnly={!!session.completedAt}
                        isWarmup
                      />
                    )
                  })
                ) : (
                  effectiveWarmups.map(exercise => (
                    <ExerciseCard key={exercise.id} exercise={exercise} readOnly isWarmup />
                  ))
                )}
              </div>
              {/* Divider */}
              <div className="flex items-center gap-2 mt-4 mb-1">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] font-mono text-muted/50 uppercase tracking-widest">Working Sets</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            </div>
          )}

          {/* Exercise cards */}
          {isToday && session ? (
            <div className="px-4 space-y-3">
              {effectiveExercises.map(exercise => {
                const sessionEx = session.exercises.find(e => e.exerciseId === exercise.id)
                return (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    sessionExercise={sessionEx}
                    sessionId={session.id}
                    onSetLogged={handleSetLogged}
                    readOnly={!!session.completedAt}
                  />
                )
              })}
            </div>
          ) : (
            <div className="px-4 space-y-3">
              {effectiveExercises.map(exercise => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  readOnly
                />
              ))}
            </div>
          )}

          {/* Complete + Abort buttons — only for active (not completed) sessions */}
          {isToday && session && !session.completedAt && (
            <div className="px-4 pt-4 space-y-2">
              <button
                onClick={() => setConfirmAction({ type: 'complete' })}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-bg font-display text-lg tracking-wider active:scale-[0.98] transition-all"
                style={{ background: 'linear-gradient(135deg, #c8e040, #e8ff47, #f0ff6a)', boxShadow: '0 0 24px rgba(232,255,71,0.35), 0 0 60px rgba(232,255,71,0.1), 0 4px 16px rgba(0,0,0,0.5)' }}
              >
                <CheckCircle2 size={18} />
                COMPLETE WORKOUT
              </button>
              <button
                onClick={() => setConfirmAction({ type: 'abort' })}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-accent-secondary/30 text-accent-secondary/70 text-xs font-mono uppercase tracking-wider hover:bg-accent-secondary/5 active:opacity-70 transition-colors"
              >
                <XCircle size={14} />
                Abort Workout
              </button>
            </div>
          )}

          {/* Confirm dialogs */}
          {confirmAction?.type === 'complete' && (
            <ConfirmDialog
              title="COMPLETE WORKOUT"
              message="Finish this session? Your logged sets will be saved to history."
              confirmLabel="Complete"
              onConfirm={() => { completeSession(session.id); setConfirmAction(null) }}
              onCancel={() => setConfirmAction(null)}
            />
          )}
          {confirmAction?.type === 'abort' && (
            <ConfirmDialog
              title="ABORT WORKOUT"
              message="All logged sets will be discarded. This cannot be undone."
              confirmLabel="Abort"
              danger
              onConfirm={() => { abortSession(session.id); setConfirmAction(null) }}
              onCancel={() => setConfirmAction(null)}
            />
          )}
        </>
      )}
    </div>
  )
}
