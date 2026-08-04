const LBS_TO_KG = 0.453592
const KG_TO_LBS = 2.20462
const MS_PER_DAY = 24 * 60 * 60 * 1000
const MS_PER_WEEK = 7 * MS_PER_DAY
const STREAK_MIN_WORKOUTS = 3
const MAX_STREAK_WEEKS = 52

export function convertWeight(weight, fromUnit, toUnit) {
  if (fromUnit === toUnit) return weight
  return fromUnit === 'lbs' ? +(weight * LBS_TO_KG).toFixed(1) : +(weight * KG_TO_LBS).toFixed(1)
}

export function displayWeight(weight, unit) {
  if (unit === 'kg') return convertWeight(weight, 'lbs', 'kg')
  return weight
}

export function calcSessionVolume(session) {
  return session.exercises.reduce((total, ex) => {
    return total + ex.sets
      .filter(s => s.completed)
      .reduce((sum, s) => sum + s.weight * s.reps, 0)
  }, 0)
}

export function calcExerciseVolume(exercise) {
  return exercise.sets
    .filter(s => s.completed)
    .reduce((sum, s) => sum + s.weight * s.reps, 0)
}

export function countCompletedSets(session) {
  return (session.exercises || []).reduce((total, ex) => {
    return total + ex.sets.filter(s => s.completed).length
  }, 0)
}

export function countTotalSets(exercises) {
  return exercises.reduce((total, ex) => total + ex.sets, 0)
}

// Best set by estimated 1RM, not raw weight: 185x6 (e1RM 222) is a better lift
// than 190x1 (e1RM 196), and e1RM is what the Progress tab reports.
export function findPR(sessions, exerciseId) {
  let best = null
  let bestScore = -1
  for (const session of sessions) {
    const ex = (session.exercises || []).find(e => e.exerciseId === exerciseId)
    if (!ex) continue
    for (const set of ex.sets) {
      if (!set.completed) continue
      const score = calcEstimated1RM(set.weight, set.reps)
      // Bodyweight sets score 0, so fall back to reps to keep them comparable.
      const tie = score === bestScore && set.reps > (best?.reps ?? 0)
      if (score > bestScore || tie) {
        bestScore = score
        best = { weight: set.weight, reps: set.reps, rpe: set.rpe || null, date: session.date }
      }
    }
  }
  return best
}

export function isWeightStagnant(sessions, exerciseId) {
  const recent = sessions
    .filter(s => s.exercises.some(e => e.exerciseId === exerciseId))
    .slice(-2)

  if (recent.length < 2) return false

  const getMaxWeight = (session) => {
    const ex = session.exercises.find(e => e.exerciseId === exerciseId)
    if (!ex) return 0
    return Math.max(...ex.sets.filter(s => s.completed).map(s => s.weight), 0)
  }

  return getMaxWeight(recent[0]) === getMaxWeight(recent[1]) && getMaxWeight(recent[0]) > 0
}

export function getLastSessionWeight(sessions, exerciseId) {
  for (let i = sessions.length - 1; i >= 0; i--) {
    const ex = sessions[i].exercises.find(e => e.exerciseId === exerciseId)
    if (!ex) continue
    const completedSets = ex.sets.filter(s => s.completed)
    if (completedSets.length > 0) {
      return completedSets[0].weight
    }
  }
  return null
}

export function getLastSessionSets(sessions, exerciseId, exerciseName) {
  for (let i = sessions.length - 1; i >= 0; i--) {
    const allExercises = [...(sessions[i].exercises || []), ...(sessions[i].warmupExercises || [])]
    const ex = allExercises.find(e => e.exerciseId === exerciseId)
      || (exerciseName && allExercises.find(e => e.name === exerciseName))
    if (!ex) continue
    const completedSets = ex.sets.filter(s => s.completed)
    if (completedSets.length > 0) {
      return completedSets.map(s => ({ weight: s.weight, reps: s.reps }))
    }
  }
  return []
}

export function getWeeksSinceDate(dateStr) {
  if (!dateStr) return Infinity
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.floor(diff / MS_PER_WEEK)
}

// Scheduled deloads have no measured hypertrophy benefit — both trials that tested
// them found neutral results, and full cessation cost strength (Coleman et al. 2024,
// PeerJ; Pancar et al. 2026, Sci Rep). So suggest one when training actually stops
// producing better sets, rather than on a calendar interval.
//
// "Stalled" = across the last `window` sessions that had logged sets, fewer than a
// quarter of the exercises you also trained in the previous `window` sessions improved
// their best estimated 1RM.
export function isProgressStalled(sessions, window = 3) {
  const trained = sessions.filter(s => countCompletedSets(s) > 0)
  if (trained.length < window * 2) return false

  const bestPerExercise = (group) => {
    const best = {}
    for (const session of group) {
      for (const ex of session.exercises || []) {
        for (const set of ex.sets) {
          if (!set.completed) continue
          const e1rm = calcEstimated1RM(set.weight, set.reps)
          if (e1rm > (best[ex.exerciseId] || 0)) best[ex.exerciseId] = e1rm
        }
      }
    }
    return best
  }

  const recent = bestPerExercise(trained.slice(-window))
  const prior = bestPerExercise(trained.slice(-window * 2, -window))
  const shared = Object.keys(recent).filter(id => prior[id] > 0)
  // Too little overlap to judge — different workouts, not a stall.
  if (shared.length < 3) return false

  const improved = shared.filter(id => recent[id] > prior[id]).length
  return improved / shared.length < 0.25
}

export function isDeloadActive(settings) {
  if (!settings.deloadActiveUntil) return false
  return new Date(settings.deloadActiveUntil) >= new Date(getTodayStr())
}

export function getDeloadSets(targetSets) {
  return Math.ceil(targetSets / 2)
}

export function formatRepRange(repsMin, repsMax) {
  if (repsMin === repsMax) return `${repsMin}`
  return `${repsMin}-${repsMax}`
}

export function formatRestTime(seconds) {
  if (seconds >= 60) {
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    return sec > 0 ? `${min}m ${sec}s` : `${min} min`
  }
  return `${seconds}s`
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function getTodayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function calcEstimated1RM(weight, reps) {
  if (reps <= 0 || weight <= 0) return 0
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}

export function getWeekStart(dateStr, weeksAgo = 0) {
  const d = new Date(dateStr + 'T12:00:00')
  // Week starts on Monday (day 1). Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
  const daysSinceMonday = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - daysSinceMonday - weeksAgo * 7)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getSessionsInWeek(sessions, weeksAgo = 0) {
  const today = getTodayStr()
  const weekStart = getWeekStart(today, weeksAgo)
  const nextWeekStart = getWeekStart(today, weeksAgo - 1)
  return sessions.filter(s => s.date >= weekStart && s.date < nextWeekStart)
}

// Primary muscles count a set at 1.0 and secondary at 0.5 — the fractional
// counting that fit the data best in Pelland et al. Untagged exercises
// (customs, pre-tagging library) fall back to muscleGroups at full weight.
export function calcSetsPerMuscleGroup(sessions, exerciseLibrary, weeksAgo = 0) {
  const weekSessions = getSessionsInWeek(sessions, weeksAgo)
  const muscleMap = {}

  const byId = {}
  for (const ex of exerciseLibrary) {
    byId[ex.id] = ex
  }

  for (const session of weekSessions) {
    for (const ex of session.exercises) {
      const completedSets = ex.sets.filter(s => s.completed).length
      if (completedSets === 0) continue
      const entry = byId[ex.exerciseId]
      const weighted = entry?.primary
        ? [...entry.primary.map(m => [m, 1]), ...(entry.secondary || []).map(m => [m, 0.5])]
        : (entry?.muscleGroups || []).map(m => [m, 1])
      for (const [muscle, weight] of weighted) {
        muscleMap[muscle] = (muscleMap[muscle] || 0) + completedSets * weight
      }
    }
  }

  return muscleMap
}

export function calcWeeklyTotalSets(sessions, weeksAgo = 0) {
  const weekSessions = getSessionsInWeek(sessions, weeksAgo)
  return weekSessions.reduce((total, s) => total + countCompletedSets(s), 0)
}

// A session counts as trained if any set was logged. Keying off completedAt
// undercounted badly — only 8 of the first 25 sessions ever had it set, because
// COMPLETE WORKOUT rarely gets tapped on the way out of the gym.
export function isTrained(session) {
  return countCompletedSets(session) > 0
}

export function calcWorkoutsThisWeek(sessions) {
  return getSessionsInWeek(sessions, 0).filter(isTrained).length
}

export function calcStreak(sessions) {
  if (sessions.length === 0) return 0
  let streak = 0
  for (let w = 0; w < MAX_STREAK_WEEKS; w++) {
    const trained = getSessionsInWeek(sessions, w).filter(isTrained).length
    if (trained >= STREAK_MIN_WORKOUTS) streak++
    else break
  }
  return streak
}

export function daysSince(dateStr) {
  if (!dateStr) return Infinity
  const diff = Date.now() - new Date(dateStr + 'T12:00:00').getTime()
  return Math.floor(diff / MS_PER_DAY)
}

export function getLastSessionForDay(sessions, dayKey) {
  for (let i = sessions.length - 1; i >= 0; i--) {
    if (sessions[i].dayKey === dayKey && sessions[i].completedAt) {
      return sessions[i]
    }
  }
  return null
}

export function getLastSessionNotes(sessions, exerciseId, exerciseName) {
  for (let i = sessions.length - 1; i >= 0; i--) {
    const allEx = [...(sessions[i].exercises || []), ...(sessions[i].warmupExercises || [])]
    const ex = allEx.find(e => e.exerciseId === exerciseId)
      || (exerciseName && allEx.find(e => e.name === exerciseName))
    if (ex?.notes) return ex.notes
  }
  return null
}

export function getProgressionRecommendation(
  sessions, exerciseId, exerciseName, targetRepsMax, isCompound, unit = 'lbs'
) {
  let lastExercise = null
  for (let i = sessions.length - 1; i >= 0; i--) {
    const allEx = [...(sessions[i].exercises || []), ...(sessions[i].warmupExercises || [])]
    const ex = allEx.find(e => e.exerciseId === exerciseId)
      || (exerciseName && allEx.find(e => e.name === exerciseName))
    if (!ex) continue
    const completedSets = ex.sets.filter(s => s.completed)
    if (completedSets.length > 0) { lastExercise = ex; break }
  }

  if (!lastExercise) {
    return { shouldIncrease: false, suggestedWeight: null, currentWeight: null,
             displaySuggested: null, displayCurrent: null, reason: 'no_data' }
  }

  const completedSets = lastExercise.sets.filter(s => s.completed)
  const allHitRepMax = completedSets.length > 0 && completedSets.every(s => s.reps >= targetRepsMax)
  const currentWeight = Math.max(...completedSets.map(s => s.weight))

  if (!allHitRepMax) {
    return {
      shouldIncrease: false, suggestedWeight: null, currentWeight,
      displaySuggested: null, displayCurrent: displayWeight(currentWeight, unit),
      reason: 'keep_pushing',
    }
  }

  const incrementLbs = isCompound ? 5 : 2.5
  const suggestedWeight = currentWeight + incrementLbs
  return {
    shouldIncrease: true, suggestedWeight, currentWeight,
    displaySuggested: displayWeight(suggestedWeight, unit),
    displayCurrent: displayWeight(currentWeight, unit),
    reason: 'increase',
  }
}
