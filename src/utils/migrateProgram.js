import { DEFAULT_PROGRAM } from '../data/workouts'

const PROGRAM_VERSION = 4

// Migrate a program object to include any new default exercises/warmups/muscleGroups
export function migrateProgram(prog) {
  if (!prog || prog._version >= PROGRAM_VERSION) return prog
  for (const dayKey of Object.keys(DEFAULT_PROGRAM)) {
    const defaults = DEFAULT_PROGRAM[dayKey]
    const current = prog[dayKey]
    if (!current) continue
    for (const ex of defaults.exercises) {
      if (!current.exercises.find(e => e.id === ex.id)) {
        current.exercises.push(ex)
      }
    }
    if (defaults.warmupExercises && !current.warmupExercises) {
      current.warmupExercises = defaults.warmupExercises
    }
    if (JSON.stringify(current.muscleGroups) !== JSON.stringify(defaults.muscleGroups)) {
      current.muscleGroups = defaults.muscleGroups
    }
  }
  prog._version = PROGRAM_VERSION
  return prog
}
