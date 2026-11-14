// What to load and how many reps to aim for today, from what was logged last time.
//
// The evidence this is built on (reports/Hypertrophy pump session evidence.md and
// reports/Muscle growth versus injury risk.md):
//   - Adding reps and adding load grow muscle equally (Plotkin 2022; Chaves 2024), so
//     reps move first and load only once it has clearly been outgrown.
//   - Stopping 1-2 reps short grows as much as failure (Refalo 2024), so nothing here
//     asks for failure, and a barbell set logged with nothing left holds the weight.
//   - Growth is the same from roughly 8 to 30 reps near failure (Schoenfeld 2017;
//     Lopez 2021), which is what lets a light lift climb in reps until a 5 lb jump —
//     a third of the load on a 15 lb raise — stops being a cliff.
//
// The numbers below are judgement, not findings: no study sets a layoff threshold,
// a stall window or a rep cap.

import { EXERCISE_LIBRARY } from '../data/workouts.js'
import { getLoadConvention } from '../data/loadConventions.js'

export const DEFAULT_STEP = 5
export const STEP_OPTIONS = [5, 10]
export const MAX_UNLOCK_REPS = 25
export const LAYOFF_DAYS = 21
export const LAYOFF_DROP = 0.1
export const STALL_SESSIONS = 3

const LIBRARY = Object.fromEntries(EXERCISE_LIBRARY.map(e => [e.id, e]))
const EPS = 1e-9

// Epley, unrounded. Poor above ~15 reps, which is fine here: it only decides when a
// jump unlocks, and landing lower than predicted is caught by the drop rule.
const oneRepMax = (load, reps) => load * (1 + reps / 30)
const repsAtLoad = (max, load) => 30 * (max / load - 1)

function equipmentOf(exercise) {
  const fromLibrary = LIBRARY[exercise.id]?.equipment
  if (fromLibrary) return fromLibrary
  const name = (exercise.name || '').toLowerCase()
  if (/barbell|ez bar/.test(name)) return 'barbell'
  if (/dumbbell|\bdb\b/.test(name)) return 'dumbbell'
  if (/cable|pulldown|pushdown|crossover/.test(name)) return 'cable'
  if (/machine|pec deck|smith/.test(name)) return 'machine'
  return null
}

// How many reps to leave on the last set. A missed rep on a cable costs nothing; a
// missed rep under a bar, alone, is the one bench-press risk that does not shrink
// with lighter weight.
export function effortTarget(exercise) {
  const equipment = equipmentOf(exercise)
  const underLoad = equipment === 'barbell'
    || (equipment === 'bodyweight' && (LIBRARY[exercise.id]?.isCompound ?? exercise.isCompound))
  if (underLoad) return { repsLeft: 2, label: 'Last set: stop with 2 reps left' }
  if (equipment === 'cable' || equipment === 'machine') {
    return { repsLeft: 0, label: 'Last set: push to 0-1 reps left' }
  }
  return { repsLeft: 1, label: 'Last set: stop with 1-2 reps left' }
}

// Held for time or distance — reps mean something else, so there is nothing to advise.
function isUntracked(exercise) {
  return getLoadConvention(exercise) === 'seconds' || LIBRARY[exercise.id]?.pattern === 'carry'
}

// A pull-up with 10 lb added is bodyweight + 10, so +5 is a small jump, not a 50% one.
function loadOf(exercise, weight, bodyweight) {
  return getLoadConvention(exercise) === 'added' ? weight + (bodyweight || 0) : weight
}

function canAddWeight(exercise, weight) {
  return weight > 0 || getLoadConvention(exercise) === 'added'
}

// Reps every set must reach before the next weight unlocks: the top of the range, or
// more when the jump is big enough that the top of the range would land below the
// bottom of it at the new weight.
export function unlockReps(exercise, weight, step, bodyweight) {
  const load = loadOf(exercise, weight, bodyweight)
  if (load <= 0) return exercise.repsMax
  const needed = Math.ceil(repsAtLoad(oneRepMax(load + step, exercise.repsMin), load) - EPS)
  return Math.min(Math.max(exercise.repsMax, MAX_UNLOCK_REPS), Math.max(exercise.repsMax, needed))
}

function predictReps(exercise, fromWeight, fromReps, toWeight, bodyweight) {
  const from = loadOf(exercise, fromWeight, bodyweight)
  const to = loadOf(exercise, toWeight, bodyweight)
  if (from <= 0 || to <= 0) return fromReps
  return Math.max(1, Math.floor(repsAtLoad(oneRepMax(from, fromReps), to) + EPS))
}

// The fewest reps a first set should manage at this weight. Usually the bottom of the
// range; lower where the jump up to this weight was capped and was always going to
// land short.
function floorReps(exercise, weight, step, bodyweight) {
  const previous = weight - step
  if (previous < 0 || loadOf(exercise, previous, bodyweight) <= 0) return exercise.repsMin
  const landing = predictReps(
    exercise, previous, unlockReps(exercise, previous, step, bodyweight), weight, bodyweight,
  )
  return Math.max(1, Math.min(exercise.repsMin, landing))
}

function daysBetween(fromDate, toDate) {
  const ms = new Date(toDate + 'T12:00:00') - new Date(fromDate + 'T12:00:00')
  return Math.round(ms / 86400000)
}

// Sets are often ramped (165, then 205 x 3). The working weight is the one most sets
// were done at, heaviest on a tie — a single heavy top set is not yet a weight owned.
function workingSets(sets) {
  const counts = new Map()
  for (const s of sets) counts.set(s.weight, (counts.get(s.weight) || 0) + 1)
  let weight = null
  for (const [w, n] of counts) {
    if (weight === null || n > counts.get(weight) || (n === counts.get(weight) && w > weight)) weight = w
  }
  return { weight, reps: sets.filter(s => s.weight === weight).map(s => s.reps) }
}

// Newest first. Reads only completed working sets; never modifies a session.
export function exerciseHistory(sessions, exerciseId, exerciseName) {
  const history = []
  for (const session of sessions || []) {
    const exercises = session.exercises || []
    const ex = exercises.find(e => e.exerciseId === exerciseId)
      || (exerciseName && exercises.find(e => e.name === exerciseName))
    if (!ex) continue
    const done = (ex.sets || []).filter(s => s.completed)
    if (done.length === 0) continue
    const { weight, reps } = workingSets(done)
    history.push({ date: session.date, weight, reps, effort: ex.effort ?? null })
  }
  return history.sort((a, b) => b.date.localeCompare(a.date))
}

const fill = (count, value) => Array.from({ length: count }, () => value)
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n))

// status: no_data | untracked | layoff | drop | hold | increase | build
export function recommend(exercise, history, { step = DEFAULT_STEP, bodyweight = 0, today } = {}) {
  const sets = Math.max(1, exercise.sets || 1)

  if (isUntracked(exercise)) {
    return { status: 'untracked', weight: history[0]?.weight ?? null, goals: null }
  }
  if (history.length === 0) return { status: 'no_data', weight: null, goals: null }

  const last = history[0]
  const weight = last.weight
  const loadable = canAddWeight(exercise, weight)
  const unlock = loadable ? unlockReps(exercise, weight, step, bodyweight) : null
  const base = {
    last: { weight, reps: last.reps, date: last.date },
    unlock,
    nextWeight: loadable ? weight + step : null,
    stalled: false,
  }
  const lowest = Math.min(...last.reps)

  // Three weeks away from a lift: come back a notch lighter and rebuild. Where 10% is
  // less than half a step, the weight stays and only the rep goal eases off.
  const daysOff = today ? daysBetween(last.date, today) : 0
  if (daysOff >= LAYOFF_DAYS && weight > 0) {
    const notches = Math.round((loadOf(exercise, weight, bodyweight) * LAYOFF_DROP) / step)
    const eased = Math.max(0, weight - notches * step)
    const usable = eased > 0 || getLoadConvention(exercise) === 'added'
    const target = notches > 0 && usable ? eased : weight
    const reps = target === weight
      ? exercise.repsMin
      : clamp(predictReps(exercise, weight, lowest, target, bodyweight), exercise.repsMin, exercise.repsMax)
    return { ...base, status: 'layoff', weight: target, goals: fill(sets, reps), daysOff }
  }

  // Opened below the floor two sessions running at this weight: it is too heavy.
  const floor = floorReps(exercise, weight, step, bodyweight)
  const previous = history[1]
  const tooHeavy = weight > 0 && last.reps[0] < floor
    && previous && previous.weight === weight && previous.reps[0] < floor
  if (tooHeavy) {
    const lighter = weight - step
    if (lighter > 0 || getLoadConvention(exercise) === 'added') {
      const target = Math.max(0, lighter)
      const reps = clamp(
        predictReps(exercise, weight, lowest, target, bodyweight),
        exercise.repsMin, unlockReps(exercise, target, step, bodyweight),
      )
      return { ...base, status: 'drop', weight: target, goals: fill(sets, reps), floor }
    }
  }

  // One lighter ramp-up set is allowed: 165, then 205 x 3 counts as four sets done.
  const neededSets = Math.min(sets, Math.max(2, sets - 1))
  const complete = last.reps.length >= neededSets
  const allAtUnlock = loadable && last.reps.every(r => r >= unlock)

  if (complete && allAtUnlock) {
    // Reached the target with nothing left, on a lift where a miss matters: earn it
    // once more with a rep or two in hand before the weight moves.
    if (last.effort === 0 && effortTarget(exercise).repsLeft === 2) {
      return { ...base, status: 'hold', weight, goals: last.reps.slice(0, sets) }
    }
    const landing = Math.min(
      predictReps(exercise, weight, lowest, weight + step, bodyweight),
      unlockReps(exercise, weight + step, step, bodyweight),
    )
    return { ...base, status: 'increase', weight: weight + step, goals: fill(sets, landing) }
  }

  // Same weight, more reps. Sets never logged at this weight get an easier goal than
  // the last one that was — getting them done comes before chasing reps on them.
  const cap = loadable ? unlock : Infinity
  const lastRep = last.reps[last.reps.length - 1]
  const missing = lastRep >= exercise.repsMin ? Math.max(exercise.repsMin, lastRep - 2) : lastRep
  const goals = Array.from({ length: sets }, (_, i) => Math.min(cap, last.reps[i] ?? missing))

  if (!allAtUnlock) {
    if (last.effort === 3) {
      // Three or more left in the tank: the whole exercise was too easy.
      for (let i = 0; i < Math.min(sets, last.reps.length); i++) goals[i] = Math.min(cap, last.reps[i] + 2)
    } else {
      // One more rep on the weakest set, earliest first: 8,8,7,7 becomes 8,8,8,7.
      const logged = goals.slice(0, Math.min(sets, last.reps.length))
      const short = logged.filter(r => r < cap)
      if (short.length > 0) goals[logged.indexOf(Math.min(...short))] += 1
    }
  }

  const window = history.slice(0, STALL_SESSIONS)
  const total = h => h.reps.reduce((a, b) => a + b, 0)
  const stalled = window.length === STALL_SESSIONS
    && window.every(h => h.weight === weight)
    && total(window[0]) <= total(window[STALL_SESSIONS - 1])

  return { ...base, status: 'build', weight, goals, stalled, neededSets, incomplete: !complete && allAtUnlock }
}

// Rep goals when the weight on the bar is not the one recommended — the weight field
// is always editable, and the goal should follow it rather than describe another load.
export function goalsForWeight(exercise, rec, weight, { step = DEFAULT_STEP, bodyweight = 0 } = {}) {
  if (!rec || !rec.goals || !rec.last) return rec?.goals ?? null
  if (weight === rec.weight) return rec.goals
  const sets = Math.max(1, exercise.sets || 1)
  const predicted = predictReps(exercise, rec.last.weight, Math.min(...rec.last.reps), weight, bodyweight)
  const ceiling = canAddWeight(exercise, weight) ? unlockReps(exercise, weight, step, bodyweight) : predicted
  return fill(sets, clamp(predicted, 1, ceiling))
}

const fmt = n => String(Math.round(n * 10) / 10)

// Two short lines for the exercise card.
export function describe(rec, unit = 'lbs') {
  if (!rec) return null
  const w = n => (n === 0 ? 'bodyweight' : `${fmt(n)} ${unit}`)
  const goal = rec.goals ? rec.goals.join(' · ') : ''
  const even = rec.goals && rec.goals.every(r => r === rec.goals[0])
  const unlockLine = rec.unlock != null && rec.nextWeight != null
    ? `${w(rec.nextWeight)} unlocks at ${rec.unlock} reps on every set`
    : null

  switch (rec.status) {
    case 'no_data':
      return { tone: 'muted', headline: 'First time — pick a weight that lands in the range with 1-2 reps left', detail: null }
    case 'increase':
      return { tone: 'accent', headline: `Add weight — ${w(rec.weight)}`, detail: `Aim for ${rec.goals[0]}+ reps a set. Fewer reps than last time is expected after a jump.` }
    case 'hold':
      return { tone: 'muted', headline: `Hold ${w(rec.weight)} — last time left nothing in the tank`, detail: `Match ${goal} with 2 reps in hand and the next weight opens.` }
    case 'drop':
      return { tone: 'warn', headline: `Drop to ${w(rec.weight)}`, detail: `Two sessions running opened below ${rec.floor} reps. Build back from here.` }
    case 'layoff':
      return {
        tone: 'warn',
        headline: rec.weight === rec.last.weight ? `${rec.daysOff} days since this lift — ease back in` : `${rec.daysOff} days since this lift — start at ${w(rec.weight)}`,
        detail: `Aim for ${rec.goals[0]} reps a set, then rebuild.`,
      }
    case 'build': {
      const headline = rec.incomplete
        ? `Do at least ${rec.neededSets} sets at ${w(rec.weight)}`
        : `Goal today: ${even ? `${rec.goals[0]} reps a set` : goal}`
      const detail = rec.stalled
        ? `No change in ${STALL_SESSIONS} sessions — take the last set closer to your limit.`
        : unlockLine
      return { tone: rec.stalled ? 'warn' : 'muted', headline, detail }
    }
    default:
      return null
  }
}
