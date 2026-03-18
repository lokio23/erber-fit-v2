export const DEFAULT_PROGRAM = {
  monday: {
    name: 'PUSH A',
    focus: 'Strength',
    muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
    exercises: [
      { id: 'bench_press', name: 'Barbell Bench Press', sets: 4, repsMin: 4, repsMax: 6, restSeconds: 180, isBuiltIn: true, isCompound: true },
      { id: 'incline_db_press', name: 'Incline Dumbbell Press', sets: 3, repsMin: 8, repsMax: 10, restSeconds: 120, isBuiltIn: true, isCompound: true },
      { id: 'seated_db_shoulder_press', name: 'Seated DB Shoulder Press', sets: 3, repsMin: 8, repsMax: 10, restSeconds: 120, isBuiltIn: true, isCompound: true },
      { id: 'cable_lateral_raise', name: 'Cable Lateral Raise', sets: 3, repsMin: 15, repsMax: 20, restSeconds: 90, isBuiltIn: true, isCompound: false },
      { id: 'overhead_cable_tricep_ext', name: 'Overhead Cable Tricep Extension', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 90, isBuiltIn: true, isCompound: false },
      { id: 'chest_dip', name: 'Chest Dip (weighted)', sets: 2, repsMin: 10, repsMax: 12, restSeconds: 90, isBuiltIn: true, isCompound: true },
    ],
  },
  tuesday: {
    name: 'PULL A',
    focus: 'Strength',
    muscleGroups: ['Back', 'Biceps', 'Rear Delts'],
    exercises: [
      { id: 'weighted_pullup', name: 'Weighted Pull-Up', sets: 4, repsMin: 4, repsMax: 6, restSeconds: 180, isBuiltIn: true, isCompound: true },
      { id: 'barbell_row', name: 'Barbell Bent-Over Row', sets: 3, repsMin: 6, repsMax: 8, restSeconds: 180, isBuiltIn: true, isCompound: true },
      { id: 'seated_cable_row', name: 'Seated Cable Row (wide grip)', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 120, isBuiltIn: true, isCompound: true },
      { id: 'face_pull', name: 'Face Pull', sets: 3, repsMin: 15, repsMax: 20, restSeconds: 90, isBuiltIn: true, isCompound: false },
      { id: 'incline_db_curl', name: 'Incline Dumbbell Curl', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90, isBuiltIn: true, isCompound: false },
      { id: 'hammer_curl', name: 'Hammer Curl', sets: 2, repsMin: 12, repsMax: 15, restSeconds: 90, isBuiltIn: true, isCompound: false },
    ],
  },
  wednesday: {
    name: 'LEGS A',
    focus: 'Strength',
    muscleGroups: ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
    exercises: [
      { id: 'barbell_squat', name: 'Barbell Back Squat', sets: 4, repsMin: 4, repsMax: 6, restSeconds: 180, isBuiltIn: true, isCompound: true },
      { id: 'romanian_deadlift', name: 'Romanian Deadlift', sets: 3, repsMin: 8, repsMax: 10, restSeconds: 180, isBuiltIn: true, isCompound: true },
      { id: 'leg_press', name: 'Leg Press', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 120, isBuiltIn: true, isCompound: true },
      { id: 'lying_leg_curl', name: 'Lying or Seated Leg Curl', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 90, isBuiltIn: true, isCompound: false },
      { id: 'bulgarian_split_squat', name: 'Bulgarian Split Squat', sets: 3, repsMin: 10, repsMax: 10, restSeconds: 120, isBuiltIn: true, isCompound: true },
      { id: 'standing_calf_raise', name: 'Standing Calf Raise', sets: 4, repsMin: 15, repsMax: 20, restSeconds: 60, isBuiltIn: true, isCompound: false },
    ],
  },
  thursday: {
    name: 'REST',
    focus: 'Recovery',
    muscleGroups: [],
    exercises: [],
  },
  friday: {
    name: 'PUSH B',
    focus: 'Volume',
    muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
    exercises: [
      { id: 'incline_barbell_press', name: 'Incline Barbell Press', sets: 4, repsMin: 8, repsMax: 10, restSeconds: 120, isBuiltIn: true, isCompound: true },
      { id: 'cable_crossover', name: 'Cable Crossover / Pec Fly', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 90, isBuiltIn: true, isCompound: false },
      { id: 'db_lateral_raise_drop', name: 'DB Lateral Raise drop set', sets: 4, repsMin: 15, repsMax: 25, restSeconds: 90, isBuiltIn: true, isCompound: false },
      { id: 'machine_shoulder_press', name: 'Machine Shoulder Press', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 120, isBuiltIn: true, isCompound: true },
      { id: 'ez_bar_skullcrusher', name: 'EZ Bar Skullcrusher', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90, isBuiltIn: true, isCompound: false },
      { id: 'cable_pushdown', name: 'Cable Pushdown', sets: 3, repsMin: 15, repsMax: 20, restSeconds: 60, isBuiltIn: true, isCompound: false },
    ],
  },
  saturday: {
    name: 'PULL B',
    focus: 'Volume',
    muscleGroups: ['Back', 'Biceps', 'Rear Delts'],
    exercises: [
      { id: 'lat_pulldown', name: 'Lat Pulldown (wide grip)', sets: 4, repsMin: 10, repsMax: 12, restSeconds: 120, isBuiltIn: true, isCompound: true },
      { id: 'single_arm_db_row', name: 'Single-Arm DB Row', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 120, isBuiltIn: true, isCompound: true },
      { id: 'cable_pullover', name: 'Cable Pullover', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 90, isBuiltIn: true, isCompound: false },
      { id: 'reverse_pec_deck', name: 'Reverse Pec Deck', sets: 3, repsMin: 15, repsMax: 20, restSeconds: 90, isBuiltIn: true, isCompound: false },
      { id: 'ez_bar_curl', name: 'EZ Bar Curl', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90, isBuiltIn: true, isCompound: false },
      { id: 'single_arm_cable_curl', name: 'Single-Arm Cable Curl', sets: 2, repsMin: 12, repsMax: 15, restSeconds: 60, isBuiltIn: true, isCompound: false },
    ],
  },
  sunday: {
    name: 'LEGS B',
    focus: 'Volume',
    muscleGroups: ['Quads', 'Hamstrings', 'Glutes'],
    exercises: [
      { id: 'hack_squat', name: 'Hack Squat or Front Squat', sets: 4, repsMin: 8, repsMax: 10, restSeconds: 120, isBuiltIn: true, isCompound: true },
      { id: 'sumo_deadlift', name: 'Sumo Deadlift', sets: 3, repsMin: 6, repsMax: 8, restSeconds: 180, isBuiltIn: true, isCompound: true },
      { id: 'walking_lunges', name: 'Walking Lunges (DBs)', sets: 3, repsMin: 12, repsMax: 12, restSeconds: 120, isBuiltIn: true, isCompound: true },
      { id: 'leg_extension', name: 'Leg Extension', sets: 3, repsMin: 15, repsMax: 20, restSeconds: 90, isBuiltIn: true, isCompound: false },
      { id: 'seated_leg_curl', name: 'Seated Leg Curl', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 90, isBuiltIn: true, isCompound: false },
      { id: 'hip_thrust', name: 'Hip Thrust (DB or Barbell)', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 90, isBuiltIn: true, isCompound: true },
    ],
  },
}

// All built-in exercise IDs for the exercise library picker
export const EXERCISE_LIBRARY = Object.values(DEFAULT_PROGRAM)
  .flatMap(day => day.exercises)
  .reduce((acc, ex) => {
    if (!acc.find(e => e.id === ex.id)) acc.push(ex)
    return acc
  }, [])
