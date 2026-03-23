import { useCallback } from 'react'
import useLocalStorage from './useLocalStorage'
import { DEFAULT_PROGRAM } from '../data/workouts'
import { getTodayStr } from '../utils/calculations'

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

const PROGRAM_VERSION = 2 // Bump when adding new default exercises

// Migrate stored program to include any new default exercises/warmups
function getInitialProgram() {
  try {
    const raw = localStorage.getItem('erberfit_program')
    if (!raw) return DEFAULT_PROGRAM
    const stored = JSON.parse(raw)
    if (stored._version >= PROGRAM_VERSION) return stored
    let changed = false
    for (const dayKey of Object.keys(DEFAULT_PROGRAM)) {
      const defaults = DEFAULT_PROGRAM[dayKey]
      const current = stored[dayKey]
      if (!current) continue
      for (const ex of defaults.exercises) {
        if (!current.exercises.find(e => e.id === ex.id)) {
          current.exercises.push(ex)
          changed = true
        }
      }
      if (defaults.warmupExercises && !current.warmupExercises) {
        current.warmupExercises = defaults.warmupExercises
        changed = true
      }
    }
    stored._version = PROGRAM_VERSION
    if (changed) localStorage.setItem('erberfit_program', JSON.stringify(stored))
    return stored
  } catch {
    return DEFAULT_PROGRAM
  }
}

export default function useWorkoutSession() {
  const [program, setProgram] = useLocalStorage('erberfit_program', getInitialProgram())
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

  const getTodaysSession = useCallback(() => {
    const dayKey = getDayKey()
    const todayStr = getTodayStr()
    const id = `${todayStr}_${dayKey}`
    return sessions.find(s => s.id === id) || null
  }, [sessions, getDayKey])

  const startSession = useCallback(() => {
    const dayKey = getDayKey()
    const todayStr = getTodayStr()
    const id = `${todayStr}_${dayKey}`
    const workout = program[dayKey]

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
        dayKey,
        workoutName: workout.name,
        warmupExercises: (workout.warmupExercises || []).map(ex => ({ ...mapExercise(ex), isWarmup: true })),
        exercises: workout.exercises.map(mapExercise),
        startedAt: new Date().toISOString(),
        completedAt: null,
      }]
    })
  }, [program, setSessions, getDayKey])

  const logSet = useCallback((sessionId, exerciseId, weight, reps, isWarmup = false) => {
    setSessions(prev => prev.map(session => {
      if (session.id !== sessionId) return session
      const key = isWarmup ? 'warmupExercises' : 'exercises'
      return {
        ...session,
        [key]: (session[key] || []).map(ex => {
          if (ex.exerciseId !== exerciseId) return ex
          return {
            ...ex,
            sets: [...ex.sets, {
              weight: Number(weight),
              reps: Number(reps),
              completed: true,
              timestamp: new Date().toISOString(),
            }],
          }
        }),
      }
    }))
  }, [setSessions])

  const updateExerciseNotes = useCallback((sessionId, exerciseId, notes, isWarmup = false) => {
    setSessions(prev => prev.map(session => {
      if (session.id !== sessionId) return session
      const key = isWarmup ? 'warmupExercises' : 'exercises'
      return {
        ...session,
        [key]: (session[key] || []).map(ex => {
          if (ex.exerciseId !== exerciseId) return ex
          return { ...ex, notes }
        }),
      }
    }))
  }, [setSessions])

  const completeSession = useCallback((sessionId) => {
    setSessions(prev => prev.map(session => {
      if (session.id !== sessionId) return session
      return { ...session, completedAt: new Date().toISOString() }
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
    updateExerciseNotes,
    completeSession,
    abortSession,
    removeSet,
  }
}
