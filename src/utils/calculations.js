const LBS_TO_KG = 0.453592
const KG_TO_LBS = 2.20462

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
  return session.exercises.reduce((total, ex) => {
    return total + ex.sets.filter(s => s.completed).length
  }, 0)
}

export function countTotalSets(exercises) {
  return exercises.reduce((total, ex) => total + ex.sets, 0)
}

export function findPR(sessions, exerciseId) {
  let best = null
  for (const session of sessions) {
    const ex = session.exercises.find(e => e.exerciseId === exerciseId)
    if (!ex) continue
    for (const set of ex.sets) {
      if (!set.completed) continue
      if (!best || set.weight > best.weight || (set.weight === best.weight && set.reps > best.reps)) {
        best = { weight: set.weight, reps: set.reps, date: session.date }
      }
    }
  }
  return best
}

export function checkProgressiveOverload(sessions, exerciseId) {
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

export function getWeeksSinceDate(dateStr) {
  if (!dateStr) return Infinity
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000))
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
  d.setDate(d.getDate() - d.getDay() - weeksAgo * 7)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getSessionsInWeek(sessions, weeksAgo = 0) {
  const today = getTodayStr()
  const weekStart = getWeekStart(today, weeksAgo)
  const nextWeekStart = getWeekStart(today, weeksAgo - 1)
  return sessions.filter(s => s.date >= weekStart && s.date < nextWeekStart)
}

export function calcSetsPerMuscleGroup(sessions, exerciseLibrary, weeksAgo = 0) {
  const weekSessions = getSessionsInWeek(sessions, weeksAgo)
  const muscleMap = {}

  // Build exercise → muscleGroups lookup from library
  const exerciseMuscles = {}
  for (const ex of exerciseLibrary) {
    exerciseMuscles[ex.id] = ex.muscleGroups || []
  }

  for (const session of weekSessions) {
    for (const ex of session.exercises) {
      const completedSets = ex.sets.filter(s => s.completed).length
      if (completedSets === 0) continue
      const muscles = exerciseMuscles[ex.exerciseId] || []
      for (const muscle of muscles) {
        muscleMap[muscle] = (muscleMap[muscle] || 0) + completedSets
      }
    }
  }

  return muscleMap
}

export function calcWeeklyTotalSets(sessions, weeksAgo = 0) {
  const weekSessions = getSessionsInWeek(sessions, weeksAgo)
  return weekSessions.reduce((total, s) => total + countCompletedSets(s), 0)
}

export function calcWorkoutsThisWeek(sessions) {
  return getSessionsInWeek(sessions, 0).filter(s => s.completedAt).length
}

export function calcStreak(sessions) {
  let streak = 0
  for (let w = 0; w < 52; w++) {
    const weekSessions = getSessionsInWeek(sessions, w)
    const completed = weekSessions.filter(s => s.completedAt).length
    if (completed >= 3) streak++
    else break
  }
  return streak
}

export function daysSince(dateStr) {
  if (!dateStr) return Infinity
  const diff = Date.now() - new Date(dateStr + 'T12:00:00').getTime()
  return Math.floor(diff / (24 * 60 * 60 * 1000))
}
