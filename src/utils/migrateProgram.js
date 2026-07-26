import { DEFAULT_PROGRAM, EXERCISE_LIBRARY } from '../data/workouts'

const PROGRAM_VERSION = 6

// v6 — evidence-based revision of the default program. See docs/PROGRAM-AUDIT.md.
//
// A stored program is only ever *merged* with new defaults, so removals and changed
// rest periods can't reach an existing user through the merge alone. This describes
// them explicitly. Applied once, keyed off _version.
const REVISION_6 = {
  // Longer rest on isolation work — Schoenfeld et al. 2016 found 1 min underperformed
  // 3 min for both strength and hypertrophy in trained men.
  monday: {
    rests: { cable_pushdown: 90 },
  },
  // Core cut from 24 to 6 direct sets/week; it was consuming 17% of weekly volume.
  tuesday: {
    remove: ['russian_twist'],
    rests: { single_arm_cable_curl: 90, cable_crunch: 90 },
  },
  // Seated calf raise grew gastrocnemius ~1% vs ~12% for standing, with no soleus
  // advantage (Kinoshita et al. 2023). Calf volume raised to 10 sets/week (Kassiano 2024).
  wednesday: {
    remove: ['hanging_leg_raise', 'cable_woodchop'],
    replace: { seated_calf_raise: 'standing_calf_raise' },
    sets: { standing_calf_raise: 5 },
    rests: { standing_calf_raise: 90 },
  },
  saturday: {
    remove: ['cable_woodchop'],
    rests: { hanging_leg_raise: 90 },
  },
  // Leg extension moves to both leg days: squats and leg presses barely grow rectus
  // femoris (Kubo 2019; Kinoshita 2026; Kassiano 2026). Leg press dropped as the most
  // redundant of four compound quad movements. Lying curl → seated, which trains the
  // hamstrings at longer length (Maeo et al. 2021, +14% vs +9%).
  sunday: {
    remove: ['leg_press', 'ab_wheel', 'plank'],
    replace: { lying_leg_curl: 'seated_leg_curl' },
    add: ['leg_extension'],
    sets: { standing_calf_raise: 5 },
    rests: { standing_calf_raise: 90 },
  },
}

// Library entries carry muscleGroups for the picker; program entries don't.
function fromLibrary(id) {
  const found = EXERCISE_LIBRARY.find(e => e.id === id)
  if (!found) return null
  const { muscleGroups, ...exercise } = found
  return exercise
}

function applyRevision(day, spec) {
  let exercises = day.exercises || []
  const tombstones = new Set(day.removedIds || [])

  if (spec.remove) {
    for (const id of spec.remove) {
      if (exercises.some(e => e.id === id)) tombstones.add(id)
    }
    exercises = exercises.filter(e => !spec.remove.includes(e.id))
  }

  if (spec.replace) {
    const before = exercises
    exercises = before.flatMap(ex => {
      const toId = spec.replace[ex.id]
      if (!toId) return [ex]
      tombstones.add(ex.id)
      // Target may already be present from the default merge — then just drop the source.
      if (before.some(e => e.id === toId)) return []
      const replacement = fromLibrary(toId)
      return replacement ? [replacement] : []
    })
  }

  if (spec.add) {
    for (const id of spec.add) {
      if (exercises.some(e => e.id === id)) continue
      const added = fromLibrary(id)
      if (added) exercises = [...exercises, added]
      tombstones.delete(id)
    }
  }

  if (spec.sets || spec.rests) {
    exercises = exercises.map(ex => {
      const sets = spec.sets?.[ex.id]
      const rest = spec.rests?.[ex.id]
      if (sets == null && rest == null) return ex
      return {
        ...ex,
        ...(sets != null ? { sets } : {}),
        ...(rest != null ? { restSeconds: rest } : {}),
      }
    })
  }

  return { ...day, exercises, removedIds: [...tombstones] }
}

// Add default exercises the user is missing, placing each one where it sits in the
// default ordering rather than appending it after their accessories.
function mergeDefaults(existing, defaultExercises, removedIds) {
  const result = [...existing]
  defaultExercises.forEach((ex, defaultIndex) => {
    if (result.some(e => e.id === ex.id) || removedIds.includes(ex.id)) return
    const precedingIds = defaultExercises.slice(0, defaultIndex).map(e => e.id)
    let insertAt = result.length
    for (let i = result.length - 1; i >= 0; i--) {
      if (precedingIds.includes(result[i].id)) {
        insertAt = i + 1
        break
      }
    }
    result.splice(insertAt, 0, { ...ex })
  })
  return result
}

// Bring a stored program up to date without mutating it, and without resurrecting
// exercises the user deliberately deleted (tracked per day in removedIds).
export function migrateProgram(prog) {
  if (!prog) return prog
  const from = typeof prog._version === 'number' ? prog._version : 0
  if (from >= PROGRAM_VERSION) return prog

  const next = { ...prog }

  for (const dayKey of Object.keys(DEFAULT_PROGRAM)) {
    const defaults = DEFAULT_PROGRAM[dayKey]
    const current = next[dayKey]
    if (!current) continue

    const removedIds = current.removedIds || []
    const existing = current.exercises || []

    next[dayKey] = {
      ...current,
      exercises: mergeDefaults(existing, defaults.exercises, removedIds),
      warmupExercises: current.warmupExercises || defaults.warmupExercises,
      muscleGroups: defaults.muscleGroups,
      removedIds,
    }
  }

  if (!next.abs) next.abs = { ...DEFAULT_PROGRAM.abs }

  // Runs after the default merge so freshly added defaults get normalised too.
  if (from < 6) {
    for (const [dayKey, spec] of Object.entries(REVISION_6)) {
      if (next[dayKey]) next[dayKey] = applyRevision(next[dayKey], spec)
    }
  }

  next._version = PROGRAM_VERSION
  return next
}
