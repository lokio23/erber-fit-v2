import { useCallback } from 'react'
import useLocalStorage from './useLocalStorage'
import { DEFAULT_PROGRAM, exerciseDisplayName } from '../data/workouts'
import { getTodayStr } from '../utils/calculations'
import { migrateProgram } from '../utils/migrateProgram'

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

// Stamp completedAt once every target set is logged, so finishing a workout
// doesn't depend on remembering to tap COMPLETE WORKOUT on the way out.
function withAutoCompletion(session) {
  if (session.completedAt) return session
  const exercises = session.exercises || []
  if (exercises.length === 0) return session
  const target = exercises.reduce((t, ex) => t + (ex.targetSets || 0), 0)
  const logged = exercises.reduce((t, ex) => t + ex.sets.filter(s => s.completed).length, 0)
  if (target === 0 || logged < target) return session
  return { ...session, completedAt: new Date().toISOString() }
}

export default function useWorkoutSession() {
  // migrateProgram runs once on the stored value rather than on every render, which is
  // what the old getInitialProgram() argument did.
  const [program, setProgram] = useLocalStorage('erberfit_program', DEFAULT_PROGRAM, migrateProgram)
  const [sessions, setSessions] = useLocalStorage('erberfit_sessions', [])
  const [settings, setSettings] = useLocalStorage('erberfit_settings', {
    unit: 'lbs',
    bodyweight: 190,
    deloadReminderEnabled: true,
    lastDeloadDate: null,
    soundEnabled: true,
    vibrationEnabled: true,
  })

  const getDayKey = useCallback(() => {
    return DAY_NAMES[new Date().getDay()]
  }, [])

  const getTodaysWorkout = useCallback(() => {
    const dayKey = getDayKey()
    return { dayKey, ...program[dayKey] }
  }, [program, getDayKey])

  const getTodaysSession = useCallback((workoutKey) => {
    const todayStr = getTodayStr()
    if (!workoutKey) return null
    if (workoutKey === 'abs') {
      return sessions.find(s => s.id === `${todayStr}_abs`) || null
    }
    const dayKey = getDayKey()
    return sessions.find(s =>
      s.date === todayStr &&
      (s.workoutKey === workoutKey || (!s.workoutKey && s.id === `${todayStr}_${dayKey}`))
    ) || null
  }, [sessions, getDayKey])

  const startSession = useCallback((workoutDayKey) => {
    const calendarDayKey = getDayKey()
    const sourceDayKey = workoutDayKey || calendarDayKey
    const todayStr = getTodayStr()
    const sessionKey = sourceDayKey === 'abs' ? 'abs' : calendarDayKey
    const id = `${todayStr}_${sessionKey}`
    const workout = program[sourceDayKey]

    setSessions(prev => {
      if (prev.find(s => s.id === id)) return prev
      const mapExercise = (ex) => ({
        exerciseId: ex.id,
        name: ex.name,
        targetSets: ex.sets,
        targetRepsMin: ex.repsMin,
        targetRepsMax: ex.repsMax,
        restSeconds: ex.restSeconds,
        isCompound: ex.isCompound,
        sets: [],
        notes: '',
      })
      return [...prev, {
        id,
        date: todayStr,
        dayKey: calendarDayKey,
        workoutKey: sourceDayKey,
        workoutName: workout.name,
        warmupExercises: (workout.warmupExercises || []).map(ex => ({ ...mapExercise(ex), isWarmup: true })),
        exercises: workout.exercises.map(mapExercise),
        startedAt: new Date().toISOString(),
        completedAt: null,
      }]
    })
  }, [program, setSessions, getDayKey])

  // Append one or more completed sets to an exercise within a session.
  const logSets = useCallback((sessionId, exerciseId, newSets, isWarmup = false) => {
    setSessions(prev => prev.map(session => {
      if (session.id !== sessionId) return session
      const key = isWarmup ? 'warmupExercises' : 'exercises'
      const exercises = session[key] || []
      const found = exercises.some(ex => ex.exerciseId === exerciseId)

      const stamped = newSets.map(s => ({
        weight: Number(s.weight),
        reps: Number(s.reps),
        rpe: s.rpe || null,
        completed: true,
        timestamp: new Date().toISOString(),
      }))

      if (found) {
        const updated = {
          ...session,
          [key]: exercises.map(ex => {
            if (ex.exerciseId !== exerciseId) return ex
            return { ...ex, sets: [...ex.sets, ...stamped] }
          }),
        }
        return isWarmup ? updated : withAutoCompletion(updated)
      }

      // Exercise was added to program after session started — add it to session
      return {
        ...session,
        [key]: [...exercises, {
          exerciseId,
          name: exerciseDisplayName(exerciseId),
          targetSets: stamped.length,
          targetRepsMin: 0,
          targetRepsMax: 0,
          restSeconds: 90,
          isCompound: false,
          sets: stamped,
          notes: '',
        }],
      }
    }))
  }, [setSessions])

  const logSet = useCallback((sessionId, exerciseId, weight, reps, rpe, isWarmup = false) => {
    logSets(sessionId, exerciseId, [{ weight, reps, rpe }], isWarmup)
  }, [logSets])

  const clearSets = useCallback((sessionId, exerciseId, isWarmup = false) => {
    setSessions(prev => prev.map(session => {
      if (session.id !== sessionId) return session
      const key = isWarmup ? 'warmupExercises' : 'exercises'
      return {
        ...session,
        [key]: (session[key] || []).map(ex => (
          ex.exerciseId === exerciseId ? { ...ex, sets: [] } : ex
        )),
      }
    }))
  }, [setSessions])

  const updateExerciseNotes = useCallback((sessionId, exerciseId, notes, isWarmup = false) => {
    setSessions(prev => prev.map(session => {
      if (session.id !== sessionId) return session
      const key = isWarmup ? 'warmupExercises' : 'exercises'
      const exercises = session[key] || []
      const found = exercises.some(ex => ex.exerciseId === exerciseId)

      if (found) {
        return {
          ...session,
          [key]: exercises.map(ex => {
            if (ex.exerciseId !== exerciseId) return ex
            return { ...ex, notes }
          }),
        }
      }

      // Exercise was added after session started
      return {
        ...session,
        [key]: [...exercises, {
          exerciseId,
          name: exerciseId,
          targetSets: 3,
          targetRepsMin: 0,
          targetRepsMax: 0,
          restSeconds: 90,
          isCompound: false,
          sets: [],
          notes,
        }],
      }
    }))
  }, [setSessions])

  const completeSession = useCallback((sessionId) => {
    setSessions(prev => prev.map(session => {
      if (session.id !== sessionId) return session
      return { ...session, completedAt: new Date().toISOString() }
    }))
  }, [setSessions])

  const resumeSession = useCallback((sessionId, done = false) => {
    setSessions(prev => prev.map(session => {
      if (session.id !== sessionId) return session
      if (done) return { ...session, resumed: false }
      // Keep completedAt so the workout still counts as complete
      return { ...session, resumed: true }
    }))
  }, [setSessions])

  const abortSession = useCallback((sessionId) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId))
  }, [setSessions])

  const removeSet = useCallback((sessionId, exerciseId, setIndex, isWarmup = false) => {
    setSessions(prev => prev.map(session => {
      if (session.id !== sessionId) return session
      const key = isWarmup ? 'warmupExercises' : 'exercises'
      return {
        ...session,
        [key]: (session[key] || []).map(ex => {
          if (ex.exerciseId !== exerciseId) return ex
          return {
            ...ex,
            sets: ex.sets.filter((_, i) => i !== setIndex),
          }
        }),
      }
    }))
  }, [setSessions])

  return {
    program,
    setProgram,
    sessions,
    setSessions,
    settings,
    setSettings,
    getDayKey,
    getTodaysWorkout,
    getTodaysSession,
    startSession,
    logSet,
    logSets,
    clearSets,
    updateExerciseNotes,
    completeSession,
    resumeSession,
    abortSession,
    removeSet,
  }
}
