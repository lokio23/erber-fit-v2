import { useCallback } from 'react'
import useLocalStorage from './useLocalStorage'
import { DEFAULT_PROGRAM } from '../data/workouts'
import { getTodayStr } from '../utils/calculations'

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export default function useWorkoutSession() {
  const [program, setProgram] = useLocalStorage('erberfit_program', DEFAULT_PROGRAM)
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
      return [...prev, {
        id,
        date: todayStr,
        dayKey,
        workoutName: workout.name,
        exercises: workout.exercises.map(ex => ({
          exerciseId: ex.id,
          name: ex.name,
          targetSets: ex.sets,
          targetRepsMin: ex.repsMin,
          targetRepsMax: ex.repsMax,
          restSeconds: ex.restSeconds,
          isCompound: ex.isCompound,
          sets: [],
          notes: '',
        })),
        startedAt: new Date().toISOString(),
        completedAt: null,
      }]
    })
  }, [program, setSessions, getDayKey])

  const logSet = useCallback((sessionId, exerciseId, weight, reps) => {
    setSessions(prev => prev.map(session => {
      if (session.id !== sessionId) return session
      return {
        ...session,
        exercises: session.exercises.map(ex => {
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

  const updateExerciseNotes = useCallback((sessionId, exerciseId, notes) => {
    setSessions(prev => prev.map(session => {
      if (session.id !== sessionId) return session
      return {
        ...session,
        exercises: session.exercises.map(ex => {
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

  const removeSet = useCallback((sessionId, exerciseId, setIndex) => {
    setSessions(prev => prev.map(session => {
      if (session.id !== sessionId) return session
      return {
        ...session,
        exercises: session.exercises.map(ex => {
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
