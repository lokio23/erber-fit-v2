// Warm-up exercise templates
const PUSH_WARMUPS = [
  { id: 'wu_band_pull_apart', name: 'Band Pull-Apart', sets: 2, repsMin: 15, repsMax: 20, restSeconds: 30, isBuiltIn: true, isCompound: false, isWarmup: true },
  { id: 'wu_arm_circles', name: 'Arm Circles (forward + back)', sets: 2, repsMin: 15, repsMax: 15, restSeconds: 0, isBuiltIn: true, isCompound: false, isWarmup: true },
  { id: 'wu_light_shoulder_press', name: 'Light DB Shoulder Press', sets: 2, repsMin: 12, repsMax: 15, restSeconds: 30, isBuiltIn: true, isCompound: true, isWarmup: true },
  { id: 'wu_pushup', name: 'Push-Up (slow tempo)', sets: 2, repsMin: 10, repsMax: 15, restSeconds: 30, isBuiltIn: true, isCompound: true, isWarmup: true },
]

const PULL_WARMUPS = [
  { id: 'wu_band_pull_apart_pull', name: 'Band Pull-Apart', sets: 2, repsMin: 15, repsMax: 20, restSeconds: 30, isBuiltIn: true, isCompound: false, isWarmup: true },
  { id: 'wu_dead_hang', name: 'Dead Hang (seconds)', sets: 2, repsMin: 20, repsMax: 30, restSeconds: 30, isBuiltIn: true, isCompound: false, isWarmup: true },
  { id: 'wu_light_lat_pulldown', name: 'Light Lat Pulldown', sets: 2, repsMin: 12, repsMax: 15, restSeconds: 30, isBuiltIn: true, isCompound: true, isWarmup: true },
  { id: 'wu_scap_pull', name: 'Scapular Pull-Up', sets: 2, repsMin: 8, repsMax: 10, restSeconds: 30, isBuiltIn: true, isCompound: false, isWarmup: true },
]

const LEGS_WARMUPS = [
  { id: 'wu_bw_squat', name: 'Bodyweight Squat', sets: 2, repsMin: 15, repsMax: 20, restSeconds: 30, isBuiltIn: true, isCompound: true, isWarmup: true },
  { id: 'wu_hip_circle', name: 'Hip Circles (each direction)', sets: 2, repsMin: 10, repsMax: 10, restSeconds: 0, isBuiltIn: true, isCompound: false, isWarmup: true },
  { id: 'wu_leg_swing', name: 'Leg Swings (front-to-back + lateral)', sets: 2, repsMin: 10, repsMax: 10, restSeconds: 0, isBuiltIn: true, isCompound: false, isWarmup: true },
  { id: 'wu_walking_lunge', name: 'Walking Lunge (bodyweight)', sets: 2, repsMin: 10, repsMax: 10, restSeconds: 30, isBuiltIn: true, isCompound: true, isWarmup: true },
]

// Sessions written before the name lookup existed stored the raw id as the name
// (e.g. "farmer_carry"), so resolve through the library when displaying.
export function exerciseDisplayName(exerciseId, storedName) {
  if (storedName && storedName !== exerciseId) return storedName
  const found = EXERCISE_LIBRARY.find(e => e.id === exerciseId)
  return found ? found.name : (storedName || exerciseId)
}

export const DEFAULT_PROGRAM = {
  monday: {
    name: 'PUSH B',
    focus: 'Volume',
    muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
    warmupExercises: PUSH_WARMUPS,
    exercises: [
      { id: 'incline_barbell_press', name: 'Incline Barbell Press', sets: 4, repsMin: 8, repsMax: 10, restSeconds: 120, isBuiltIn: true, isCompound: true },
      { id: 'cable_crossover', name: 'Cable Crossover / Pec Fly', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 90, isBuiltIn: true, isCompound: false },
      { id: 'db_lateral_raise_drop', name: 'DB Lateral Raise drop set', sets: 4, repsMin: 15, repsMax: 25, restSeconds: 90, isBuiltIn: true, isCompound: false },
      { id: 'machine_shoulder_press', name: 'Machine Shoulder Press', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 120, isBuiltIn: true, isCompound: true },
      { id: 'ez_bar_skullcrusher', name: 'EZ Bar Skullcrusher', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90, isBuiltIn: true, isCompound: false },
      { id: 'cable_pushdown', name: 'Cable Pushdown', sets: 3, repsMin: 15, repsMax: 20, restSeconds: 90, isBuiltIn: true, isCompound: false },
    ],
  },
  tuesday: {
    name: 'PULL B',
    focus: 'Volume',
    muscleGroups: ['Back', 'Biceps', 'Rear Delts'],
    warmupExercises: PULL_WARMUPS,
    exercises: [
      { id: 'lat_pulldown', name: 'Lat Pulldown (wide grip)', sets: 4, repsMin: 10, repsMax: 12, restSeconds: 120, isBuiltIn: true, isCompound: true },
      { id: 'single_arm_db_row', name: 'Single-Arm DB Row', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 120, isBuiltIn: true, isCompound: true },
      { id: 'cable_pullover', name: 'Cable Pullover', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 90, isBuiltIn: true, isCompound: false },
      { id: 'reverse_pec_deck', name: 'Reverse Pec Deck', sets: 3, repsMin: 15, repsMax: 20, restSeconds: 90, isBuiltIn: true, isCompound: false },
      { id: 'ez_bar_curl', name: 'EZ Bar Curl', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90, isBuiltIn: true, isCompound: false },
      { id: 'single_arm_cable_curl', name: 'Single-Arm Cable Curl', sets: 2, repsMin: 12, repsMax: 15, restSeconds: 90, isBuiltIn: true, isCompound: false },
      { id: 'cable_crunch', name: 'Cable Crunch', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 90, isBuiltIn: true, isCompound: false, isCore: true },
    ],
  },
  wednesday: {
    name: 'LEGS B',
    focus: 'Volume',
    muscleGroups: ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
    warmupExercises: LEGS_WARMUPS,
    exercises: [
      { id: 'hack_squat', name: 'Hack Squat or Front Squat', sets: 4, repsMin: 8, repsMax: 10, restSeconds: 120, isBuiltIn: true, isCompound: true },
      { id: 'sumo_deadlift', name: 'Sumo Deadlift', sets: 3, repsMin: 6, repsMax: 8, restSeconds: 180, isBuiltIn: true, isCompound: true },
      { id: 'walking_lunges', name: 'Walking Lunges (DBs)', sets: 3, repsMin: 12, repsMax: 12, restSeconds: 120, isBuiltIn: true, isCompound: true },
      { id: 'leg_extension', name: 'Leg Extension', sets: 3, repsMin: 15, repsMax: 20, restSeconds: 90, isBuiltIn: true, isCompound: false },
      { id: 'seated_leg_curl', name: 'Seated Leg Curl', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 90, isBuiltIn: true, isCompound: false },
      { id: 'hip_thrust', name: 'Hip Thrust (DB or Barbell)', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 90, isBuiltIn: true, isCompound: true },
      { id: 'standing_calf_raise', name: 'Standing Calf Raise', sets: 5, repsMin: 15, repsMax: 20, restSeconds: 90, isBuiltIn: true, isCompound: false },
    ],
  },
  thursday: {
    name: 'REST',
    focus: 'Recovery',
    muscleGroups: [],
    warmupExercises: [],
    exercises: [],
  },
  friday: {
    name: 'PUSH A',
    focus: 'Strength',
    muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
    warmupExercises: PUSH_WARMUPS,
    exercises: [
      { id: 'bench_press', name: 'Barbell Bench Press', sets: 4, repsMin: 4, repsMax: 6, restSeconds: 180, isBuiltIn: true, isCompound: true },
      { id: 'incline_db_press', name: 'Incline Dumbbell Press', sets: 3, repsMin: 8, repsMax: 10, restSeconds: 120, isBuiltIn: true, isCompound: true },
      { id: 'seated_db_shoulder_press', name: 'Seated DB Shoulder Press', sets: 3, repsMin: 8, repsMax: 10, restSeconds: 120, isBuiltIn: true, isCompound: true },
      { id: 'cable_lateral_raise', name: 'Cable Lateral Raise', sets: 3, repsMin: 15, repsMax: 20, restSeconds: 90, isBuiltIn: true, isCompound: false },
      { id: 'overhead_cable_tricep_ext', name: 'Overhead Cable Tricep Extension', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 90, isBuiltIn: true, isCompound: false },
      { id: 'chest_dip', name: 'Chest Dip (weighted)', sets: 2, repsMin: 10, repsMax: 12, restSeconds: 90, isBuiltIn: true, isCompound: true },
    ],
  },
  saturday: {
    name: 'PULL A',
    focus: 'Strength',
    muscleGroups: ['Back', 'Biceps', 'Rear Delts'],
    warmupExercises: PULL_WARMUPS,
    exercises: [
      { id: 'weighted_pullup', name: 'Weighted Pull-Up', sets: 4, repsMin: 4, repsMax: 6, restSeconds: 180, isBuiltIn: true, isCompound: true },
      { id: 'barbell_row', name: 'Barbell Bent-Over Row', sets: 3, repsMin: 6, repsMax: 8, restSeconds: 180, isBuiltIn: true, isCompound: true },
      { id: 'seated_cable_row', name: 'Seated Cable Row (wide grip)', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 120, isBuiltIn: true, isCompound: true },
      { id: 'face_pull', name: 'Face Pull', sets: 3, repsMin: 15, repsMax: 20, restSeconds: 90, isBuiltIn: true, isCompound: false },
      { id: 'incline_db_curl', name: 'Incline Dumbbell Curl', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90, isBuiltIn: true, isCompound: false },
      { id: 'hammer_curl', name: 'Hammer Curl', sets: 2, repsMin: 12, repsMax: 15, restSeconds: 90, isBuiltIn: true, isCompound: false },
      { id: 'hanging_leg_raise', name: 'Hanging Leg Raise', sets: 3, repsMin: 10, repsMax: 15, restSeconds: 90, isBuiltIn: true, isCompound: false, isCore: true },
    ],
  },
  sunday: {
    name: 'LEGS A',
    focus: 'Strength',
    muscleGroups: ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
    warmupExercises: LEGS_WARMUPS,
    exercises: [
      { id: 'barbell_squat', name: 'Barbell Back Squat', sets: 4, repsMin: 4, repsMax: 6, restSeconds: 180, isBuiltIn: true, isCompound: true },
      { id: 'romanian_deadlift', name: 'Romanian Deadlift', sets: 3, repsMin: 8, repsMax: 10, restSeconds: 180, isBuiltIn: true, isCompound: true },
      { id: 'bulgarian_split_squat', name: 'Bulgarian Split Squat', sets: 3, repsMin: 10, repsMax: 10, restSeconds: 120, isBuiltIn: true, isCompound: true },
      { id: 'leg_extension', name: 'Leg Extension', sets: 3, repsMin: 15, repsMax: 20, restSeconds: 90, isBuiltIn: true, isCompound: false },
      { id: 'seated_leg_curl', name: 'Seated Leg Curl', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 90, isBuiltIn: true, isCompound: false },
      { id: 'standing_calf_raise', name: 'Standing Calf Raise', sets: 5, repsMin: 15, repsMax: 20, restSeconds: 90, isBuiltIn: true, isCompound: false },
    ],
  },
  abs: {
    name: 'ABS',
    focus: 'Core',
    muscleGroups: ['Core'],
    warmupExercises: [],
    exercises: [
      { id: 'hanging_leg_raise', name: 'Hanging Leg Raise', sets: 3, repsMin: 10, repsMax: 15, restSeconds: 60, isBuiltIn: true, isCompound: false, isCore: true },
      { id: 'ab_wheel', name: 'Ab Wheel Rollout', sets: 3, repsMin: 8, repsMax: 12, restSeconds: 60, isBuiltIn: true, isCompound: true, isCore: true },
      { id: 'cable_crunch', name: 'Cable Crunch', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60, isBuiltIn: true, isCompound: false, isCore: true },
      { id: 'russian_twist', name: 'Russian Twist', sets: 3, repsMin: 15, repsMax: 20, restSeconds: 60, isBuiltIn: true, isCompound: false, isCore: true },
    ],
  },
}

// Comprehensive exercise library organized by muscle group
export const EXERCISE_LIBRARY = [
  // ── WARM-UPS ──
  { id: 'wu_band_pull_apart', name: 'Band Pull-Apart', sets: 2, repsMin: 15, repsMax: 20, restSeconds: 30, isBuiltIn: true, isCompound: false, isWarmup: true, muscleGroups: ['Warm-Up'] },
  { id: 'wu_arm_circles', name: 'Arm Circles (forward + back)', sets: 2, repsMin: 15, repsMax: 15, restSeconds: 0, isBuiltIn: true, isCompound: false, isWarmup: true, muscleGroups: ['Warm-Up'] },
  { id: 'wu_light_shoulder_press', name: 'Light DB Shoulder Press', sets: 2, repsMin: 12, repsMax: 15, restSeconds: 30, isBuiltIn: true, isCompound: true, isWarmup: true, muscleGroups: ['Warm-Up'] },
  { id: 'wu_pushup', name: 'Push-Up (slow tempo)', sets: 2, repsMin: 10, repsMax: 15, restSeconds: 30, isBuiltIn: true, isCompound: true, isWarmup: true, muscleGroups: ['Warm-Up'] },
  { id: 'wu_band_pull_apart_pull', name: 'Band Pull-Apart', sets: 2, repsMin: 15, repsMax: 20, restSeconds: 30, isBuiltIn: true, isCompound: false, isWarmup: true, muscleGroups: ['Warm-Up'] },
  { id: 'wu_dead_hang', name: 'Dead Hang (seconds)', sets: 2, repsMin: 20, repsMax: 30, restSeconds: 30, isBuiltIn: true, isCompound: false, isWarmup: true, muscleGroups: ['Warm-Up'] },
  { id: 'wu_light_lat_pulldown', name: 'Light Lat Pulldown', sets: 2, repsMin: 12, repsMax: 15, restSeconds: 30, isBuiltIn: true, isCompound: true, isWarmup: true, muscleGroups: ['Warm-Up'] },
  { id: 'wu_scap_pull', name: 'Scapular Pull-Up', sets: 2, repsMin: 8, repsMax: 10, restSeconds: 30, isBuiltIn: true, isCompound: false, isWarmup: true, muscleGroups: ['Warm-Up'] },
  { id: 'wu_bw_squat', name: 'Bodyweight Squat', sets: 2, repsMin: 15, repsMax: 20, restSeconds: 30, isBuiltIn: true, isCompound: true, isWarmup: true, muscleGroups: ['Warm-Up'] },
  { id: 'wu_hip_circle', name: 'Hip Circles (each direction)', sets: 2, repsMin: 10, repsMax: 10, restSeconds: 0, isBuiltIn: true, isCompound: false, isWarmup: true, muscleGroups: ['Warm-Up'] },
  { id: 'wu_leg_swing', name: 'Leg Swings (front-to-back + lateral)', sets: 2, repsMin: 10, repsMax: 10, restSeconds: 0, isBuiltIn: true, isCompound: false, isWarmup: true, muscleGroups: ['Warm-Up'] },
  { id: 'wu_walking_lunge', name: 'Walking Lunge (bodyweight)', sets: 2, repsMin: 10, repsMax: 10, restSeconds: 30, isBuiltIn: true, isCompound: true, isWarmup: true, muscleGroups: ['Warm-Up'] },
  { id: 'wu_shoulder_dislocate', name: 'Shoulder Dislocate (band/stick)', sets: 2, repsMin: 10, repsMax: 15, restSeconds: 0, isBuiltIn: true, isCompound: false, isWarmup: true, muscleGroups: ['Warm-Up'] },
  { id: 'wu_cat_cow', name: 'Cat-Cow Stretch', sets: 2, repsMin: 10, repsMax: 10, restSeconds: 0, isBuiltIn: true, isCompound: false, isWarmup: true, muscleGroups: ['Warm-Up'] },
  { id: 'wu_world_greatest_stretch', name: 'World\'s Greatest Stretch', sets: 2, repsMin: 5, repsMax: 5, restSeconds: 0, isBuiltIn: true, isCompound: true, isWarmup: true, muscleGroups: ['Warm-Up'] },
  { id: 'wu_glute_bridge', name: 'Glute Bridge', sets: 2, repsMin: 15, repsMax: 20, restSeconds: 30, isBuiltIn: true, isCompound: false, isWarmup: true, muscleGroups: ['Warm-Up'] },
  { id: 'wu_inchworm', name: 'Inchworm Walk-Out', sets: 2, repsMin: 6, repsMax: 8, restSeconds: 30, isBuiltIn: true, isCompound: true, isWarmup: true, muscleGroups: ['Warm-Up'] },
  { id: 'wu_face_pull_light', name: 'Light Face Pull', sets: 2, repsMin: 15, repsMax: 20, restSeconds: 30, isBuiltIn: true, isCompound: false, isWarmup: true, muscleGroups: ['Warm-Up'] },

  // ── CHEST ──
  { id: 'bench_press', name: 'Barbell Bench Press', sets: 4, repsMin: 4, repsMax: 6, restSeconds: 180, isBuiltIn: true, isCompound: true, muscleGroups: ['Chest', 'Triceps'], pattern: 'horizontal_press', primary: ['Chest'], secondary: ['Triceps', 'Shoulders'], lengthPosition: 'mid', equipment: 'barbell', technicalDemand: 'medium', locked: true },
  { id: 'incline_db_press', name: 'Incline Dumbbell Press', sets: 3, repsMin: 8, repsMax: 10, restSeconds: 120, isBuiltIn: true, isCompound: true, muscleGroups: ['Chest', 'Shoulders'], pattern: 'incline_press', primary: ['Chest'], secondary: ['Triceps', 'Shoulders'], lengthPosition: 'mid', equipment: 'dumbbell', technicalDemand: 'medium' },
  { id: 'incline_barbell_press', name: 'Incline Barbell Press', sets: 4, repsMin: 8, repsMax: 10, restSeconds: 120, isBuiltIn: true, isCompound: true, muscleGroups: ['Chest', 'Shoulders'], pattern: 'incline_press', primary: ['Chest'], secondary: ['Triceps', 'Shoulders'], lengthPosition: 'mid', equipment: 'barbell', technicalDemand: 'medium', locked: true },
  { id: 'flat_db_press', name: 'Flat Dumbbell Press', sets: 3, repsMin: 8, repsMax: 12, restSeconds: 120, isBuiltIn: true, isCompound: true, muscleGroups: ['Chest', 'Triceps'], pattern: 'horizontal_press', primary: ['Chest'], secondary: ['Triceps', 'Shoulders'], lengthPosition: 'mid', equipment: 'dumbbell', technicalDemand: 'medium' },
  { id: 'decline_bench_press', name: 'Decline Bench Press', sets: 3, repsMin: 8, repsMax: 10, restSeconds: 120, isBuiltIn: true, isCompound: true, muscleGroups: ['Chest', 'Triceps'], pattern: 'horizontal_press', primary: ['Chest'], secondary: ['Triceps', 'Shoulders'], lengthPosition: 'mid', equipment: 'barbell', technicalDemand: 'medium' },
  { id: 'close_grip_bench', name: 'Close-Grip Bench Press', sets: 3, repsMin: 8, repsMax: 10, restSeconds: 120, isBuiltIn: true, isCompound: true, muscleGroups: ['Chest', 'Triceps'], pattern: 'horizontal_press', primary: ['Triceps'], secondary: ['Chest', 'Shoulders'], lengthPosition: 'mid', equipment: 'barbell', technicalDemand: 'medium' },
  { id: 'floor_press', name: 'Floor Press (Barbell or DB)', sets: 3, repsMin: 8, repsMax: 10, restSeconds: 120, isBuiltIn: true, isCompound: true, muscleGroups: ['Chest', 'Triceps'], pattern: 'horizontal_press', primary: ['Chest'], secondary: ['Triceps', 'Shoulders'], lengthPosition: 'shortened', equipment: 'barbell', technicalDemand: 'medium' },
  { id: 'machine_chest_press', name: 'Machine Chest Press', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90, isBuiltIn: true, isCompound: true, muscleGroups: ['Chest'], pattern: 'horizontal_press', primary: ['Chest'], secondary: ['Triceps', 'Shoulders'], lengthPosition: 'mid', equipment: 'machine', technicalDemand: 'low' },
  { id: 'cable_crossover', name: 'Cable Crossover / Pec Fly', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 90, isBuiltIn: true, isCompound: false, muscleGroups: ['Chest'], pattern: 'chest_fly', primary: ['Chest'], secondary: [], lengthPosition: 'mid', equipment: 'cable', technicalDemand: 'low' },
  { id: 'db_chest_fly', name: 'Dumbbell Chest Fly', sets: 3, repsMin: 10, repsMax: 15, restSeconds: 90, isBuiltIn: true, isCompound: false, muscleGroups: ['Chest'], pattern: 'chest_fly', primary: ['Chest'], secondary: [], lengthPosition: 'lengthened', equipment: 'dumbbell', technicalDemand: 'low' },
  { id: 'chest_dip', name: 'Chest Dip (weighted)', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90, isBuiltIn: true, isCompound: true, muscleGroups: ['Chest', 'Triceps'], pattern: 'dip', primary: ['Chest'], secondary: ['Triceps'], lengthPosition: 'lengthened', equipment: 'bodyweight', technicalDemand: 'medium' },
  { id: 'push_up', name: 'Push-Up (weighted or BW)', sets: 3, repsMin: 10, repsMax: 20, restSeconds: 60, isBuiltIn: true, isCompound: true, muscleGroups: ['Chest', 'Triceps'], pattern: 'horizontal_press', primary: ['Chest'], secondary: ['Triceps', 'Shoulders'], lengthPosition: 'mid', equipment: 'bodyweight', technicalDemand: 'medium' },
  { id: 'landmine_press', name: 'Landmine Press', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90, isBuiltIn: true, isCompound: true, muscleGroups: ['Chest', 'Shoulders'], pattern: 'incline_press', primary: ['Chest'], secondary: ['Triceps', 'Shoulders'], lengthPosition: 'mid', equipment: 'barbell', technicalDemand: 'medium' },
  { id: 'svend_press', name: 'Svend Press', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60, isBuiltIn: true, isCompound: false, muscleGroups: ['Chest'], pattern: 'chest_fly', primary: ['Chest'], secondary: [], lengthPosition: 'shortened', equipment: 'dumbbell', technicalDemand: 'low' },

  // ── SHOULDERS ──
  { id: 'seated_db_shoulder_press', name: 'Seated DB Shoulder Press', sets: 3, repsMin: 8, repsMax: 10, restSeconds: 120, isBuiltIn: true, isCompound: true, muscleGroups: ['Shoulders'], pattern: 'vertical_press', primary: ['Shoulders'], secondary: ['Triceps'], lengthPosition: 'mid', equipment: 'dumbbell', technicalDemand: 'medium' },
  { id: 'machine_shoulder_press', name: 'Machine Shoulder Press', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 120, isBuiltIn: true, isCompound: true, muscleGroups: ['Shoulders'], pattern: 'vertical_press', primary: ['Shoulders'], secondary: ['Triceps'], lengthPosition: 'mid', equipment: 'machine', technicalDemand: 'low' },
  { id: 'standing_ohp', name: 'Standing Overhead Press', sets: 4, repsMin: 5, repsMax: 8, restSeconds: 180, isBuiltIn: true, isCompound: true, muscleGroups: ['Shoulders', 'Triceps'], pattern: 'vertical_press', primary: ['Shoulders'], secondary: ['Triceps'], lengthPosition: 'mid', equipment: 'barbell', technicalDemand: 'high', locked: true },
  { id: 'arnold_press', name: 'Arnold Press', sets: 3, repsMin: 8, repsMax: 12, restSeconds: 120, isBuiltIn: true, isCompound: true, muscleGroups: ['Shoulders'], pattern: 'vertical_press', primary: ['Shoulders'], secondary: ['Triceps'], lengthPosition: 'mid', equipment: 'dumbbell', technicalDemand: 'medium' },
  { id: 'cable_lateral_raise', name: 'Cable Lateral Raise', sets: 3, repsMin: 15, repsMax: 20, restSeconds: 90, isBuiltIn: true, isCompound: false, muscleGroups: ['Shoulders'], pattern: 'lateral_raise', primary: ['Shoulders'], secondary: [], lengthPosition: 'mid', equipment: 'cable', technicalDemand: 'low' },
  { id: 'db_lateral_raise', name: 'Dumbbell Lateral Raise', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60, isBuiltIn: true, isCompound: false, muscleGroups: ['Shoulders'], pattern: 'lateral_raise', primary: ['Shoulders'], secondary: [], lengthPosition: 'shortened', equipment: 'dumbbell', technicalDemand: 'low' },
  { id: 'db_lateral_raise_drop', name: 'DB Lateral Raise drop set', sets: 4, repsMin: 15, repsMax: 25, restSeconds: 90, isBuiltIn: true, isCompound: false, muscleGroups: ['Shoulders'], pattern: 'lateral_raise', primary: ['Shoulders'], secondary: [], lengthPosition: 'shortened', equipment: 'dumbbell', technicalDemand: 'low' },
  { id: 'db_front_raise', name: 'Dumbbell Front Raise', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60, isBuiltIn: true, isCompound: false, muscleGroups: ['Shoulders'], pattern: 'front_raise', primary: ['Shoulders'], secondary: [], lengthPosition: 'shortened', equipment: 'dumbbell', technicalDemand: 'low' },
  { id: 'plate_front_raise', name: 'Plate Front Raise', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60, isBuiltIn: true, isCompound: false, muscleGroups: ['Shoulders'], pattern: 'front_raise', primary: ['Shoulders'], secondary: [], lengthPosition: 'shortened', equipment: 'dumbbell', technicalDemand: 'low' },
  { id: 'upright_row', name: 'Upright Row (Cable or BB)', sets: 3, repsMin: 10, repsMax: 15, restSeconds: 90, isBuiltIn: true, isCompound: true, muscleGroups: ['Shoulders'], pattern: 'upright_row', primary: ['Shoulders'], secondary: ['Back'], lengthPosition: 'shortened', equipment: 'cable', technicalDemand: 'medium' },
  { id: 'lu_raise', name: 'Lu Raise', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60, isBuiltIn: true, isCompound: false, muscleGroups: ['Shoulders'], pattern: 'lateral_raise', primary: ['Shoulders'], secondary: [], lengthPosition: 'shortened', equipment: 'dumbbell', technicalDemand: 'low' },

  // ── TRICEPS ──
  { id: 'overhead_cable_tricep_ext', name: 'Overhead Cable Tricep Extension', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 90, isBuiltIn: true, isCompound: false, muscleGroups: ['Triceps'], pattern: 'elbow_extension', primary: ['Triceps'], secondary: [], lengthPosition: 'lengthened', equipment: 'cable', technicalDemand: 'low' },
  { id: 'cable_pushdown', name: 'Cable Pushdown', sets: 3, repsMin: 15, repsMax: 20, restSeconds: 60, isBuiltIn: true, isCompound: false, muscleGroups: ['Triceps'], pattern: 'elbow_extension', primary: ['Triceps'], secondary: [], lengthPosition: 'shortened', equipment: 'cable', technicalDemand: 'low' },
  { id: 'ez_bar_skullcrusher', name: 'EZ Bar Skullcrusher', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90, isBuiltIn: true, isCompound: false, muscleGroups: ['Triceps'], pattern: 'elbow_extension', primary: ['Triceps'], secondary: [], lengthPosition: 'mid', equipment: 'barbell', technicalDemand: 'medium' },
  { id: 'tricep_kickback', name: 'Tricep Kickback (DB or Cable)', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60, isBuiltIn: true, isCompound: false, muscleGroups: ['Triceps'], pattern: 'elbow_extension', primary: ['Triceps'], secondary: [], lengthPosition: 'shortened', equipment: 'dumbbell', technicalDemand: 'low' },
  { id: 'diamond_pushup', name: 'Diamond Push-Up', sets: 3, repsMin: 10, repsMax: 15, restSeconds: 60, isBuiltIn: true, isCompound: true, muscleGroups: ['Triceps', 'Chest'], pattern: 'horizontal_press', primary: ['Triceps'], secondary: ['Chest', 'Shoulders'], lengthPosition: 'mid', equipment: 'bodyweight', technicalDemand: 'medium' },
  { id: 'tricep_dip', name: 'Tricep Dip (bench)', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60, isBuiltIn: true, isCompound: true, muscleGroups: ['Triceps'], pattern: 'dip', primary: ['Triceps'], secondary: ['Chest'], lengthPosition: 'mid', equipment: 'bodyweight', technicalDemand: 'medium' },
  { id: 'single_arm_pushdown', name: 'Single-Arm Cable Pushdown', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60, isBuiltIn: true, isCompound: false, muscleGroups: ['Triceps'], pattern: 'elbow_extension', primary: ['Triceps'], secondary: [], lengthPosition: 'shortened', equipment: 'cable', technicalDemand: 'low' },

  // ── BACK ──
  { id: 'weighted_pullup', name: 'Weighted Pull-Up', sets: 4, repsMin: 4, repsMax: 6, restSeconds: 180, isBuiltIn: true, isCompound: true, muscleGroups: ['Back', 'Biceps'], pattern: 'vertical_pull', primary: ['Back'], secondary: ['Biceps'], lengthPosition: 'mid', equipment: 'bodyweight', technicalDemand: 'medium', locked: true },
  { id: 'chin_up', name: 'Chin-Up (weighted or BW)', sets: 3, repsMin: 6, repsMax: 10, restSeconds: 120, isBuiltIn: true, isCompound: true, muscleGroups: ['Back', 'Biceps'], pattern: 'vertical_pull', primary: ['Back'], secondary: ['Biceps'], lengthPosition: 'mid', equipment: 'bodyweight', technicalDemand: 'medium' },
  { id: 'barbell_row', name: 'Barbell Bent-Over Row', sets: 3, repsMin: 6, repsMax: 8, restSeconds: 180, isBuiltIn: true, isCompound: true, muscleGroups: ['Back'], pattern: 'horizontal_row', primary: ['Back'], secondary: ['Biceps', 'Rear Delts'], lengthPosition: 'mid', equipment: 'barbell', technicalDemand: 'high', locked: true },
  { id: 'pendlay_row', name: 'Pendlay Row', sets: 3, repsMin: 5, repsMax: 8, restSeconds: 180, isBuiltIn: true, isCompound: true, muscleGroups: ['Back'], pattern: 'horizontal_row', primary: ['Back'], secondary: ['Biceps', 'Rear Delts'], lengthPosition: 'mid', equipment: 'barbell', technicalDemand: 'high', locked: true },
  { id: 't_bar_row', name: 'T-Bar Row', sets: 3, repsMin: 8, repsMax: 12, restSeconds: 120, isBuiltIn: true, isCompound: true, muscleGroups: ['Back'], pattern: 'horizontal_row', primary: ['Back'], secondary: ['Biceps', 'Rear Delts'], lengthPosition: 'mid', equipment: 'barbell', technicalDemand: 'medium' },
  { id: 'single_arm_db_row', name: 'Single-Arm DB Row', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 120, isBuiltIn: true, isCompound: true, muscleGroups: ['Back'], pattern: 'horizontal_row', primary: ['Back'], secondary: ['Biceps', 'Rear Delts'], lengthPosition: 'mid', equipment: 'dumbbell', technicalDemand: 'medium' },
  { id: 'chest_supported_row', name: 'Chest-Supported Row', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90, isBuiltIn: true, isCompound: true, muscleGroups: ['Back'], pattern: 'horizontal_row', primary: ['Back'], secondary: ['Biceps', 'Rear Delts'], lengthPosition: 'mid', equipment: 'machine', technicalDemand: 'medium' },
  { id: 'meadows_row', name: 'Meadows Row', sets: 3, repsMin: 8, repsMax: 12, restSeconds: 90, isBuiltIn: true, isCompound: true, muscleGroups: ['Back'], pattern: 'horizontal_row', primary: ['Back'], secondary: ['Biceps', 'Rear Delts'], lengthPosition: 'mid', equipment: 'barbell', technicalDemand: 'high' },
  { id: 'seated_cable_row', name: 'Seated Cable Row', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 120, isBuiltIn: true, isCompound: true, muscleGroups: ['Back'], pattern: 'horizontal_row', primary: ['Back'], secondary: ['Biceps', 'Rear Delts'], lengthPosition: 'mid', equipment: 'cable', technicalDemand: 'low' },
  { id: 'lat_pulldown', name: 'Lat Pulldown (wide grip)', sets: 4, repsMin: 10, repsMax: 12, restSeconds: 120, isBuiltIn: true, isCompound: true, muscleGroups: ['Back'], pattern: 'vertical_pull', primary: ['Back'], secondary: ['Biceps'], lengthPosition: 'mid', equipment: 'cable', technicalDemand: 'low' },
  { id: 'neutral_grip_pulldown', name: 'Neutral Grip Lat Pulldown', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90, isBuiltIn: true, isCompound: true, muscleGroups: ['Back'], pattern: 'vertical_pull', primary: ['Back'], secondary: ['Biceps'], lengthPosition: 'mid', equipment: 'cable', technicalDemand: 'low' },
  { id: 'straight_arm_pulldown', name: 'Straight-Arm Pulldown', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 90, isBuiltIn: true, isCompound: false, muscleGroups: ['Back'], pattern: 'pullover', primary: ['Back'], secondary: ['Chest', 'Triceps'], lengthPosition: 'lengthened', equipment: 'cable', technicalDemand: 'low' },
  { id: 'cable_pullover', name: 'Cable Pullover', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 90, isBuiltIn: true, isCompound: false, muscleGroups: ['Back'], pattern: 'pullover', primary: ['Back'], secondary: ['Chest', 'Triceps'], lengthPosition: 'lengthened', equipment: 'cable', technicalDemand: 'low' },
  { id: 'inverted_row', name: 'Inverted Row', sets: 3, repsMin: 8, repsMax: 15, restSeconds: 90, isBuiltIn: true, isCompound: true, muscleGroups: ['Back'], pattern: 'horizontal_row', primary: ['Back'], secondary: ['Biceps', 'Rear Delts'], lengthPosition: 'mid', equipment: 'bodyweight', technicalDemand: 'medium' },
  { id: 'rack_pull', name: 'Rack Pull', sets: 3, repsMin: 5, repsMax: 8, restSeconds: 180, isBuiltIn: true, isCompound: true, muscleGroups: ['Back'], pattern: 'deadlift', primary: ['Back'], secondary: ['Glutes', 'Hamstrings'], lengthPosition: 'mid', equipment: 'barbell', technicalDemand: 'high', locked: true },
  { id: 'db_shrug', name: 'Dumbbell Shrug', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60, isBuiltIn: true, isCompound: false, muscleGroups: ['Back'], pattern: 'shrug', primary: ['Back'], secondary: [], lengthPosition: 'shortened', equipment: 'dumbbell', technicalDemand: 'low' },
  { id: 'barbell_shrug', name: 'Barbell Shrug', sets: 4, repsMin: 10, repsMax: 15, restSeconds: 90, isBuiltIn: true, isCompound: false, muscleGroups: ['Back'], pattern: 'shrug', primary: ['Back'], secondary: [], lengthPosition: 'shortened', equipment: 'barbell', technicalDemand: 'low' },

  // ── BICEPS ──
  { id: 'incline_db_curl', name: 'Incline Dumbbell Curl', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90, isBuiltIn: true, isCompound: false, muscleGroups: ['Biceps'], pattern: 'elbow_flexion', primary: ['Biceps'], secondary: [], lengthPosition: 'lengthened', equipment: 'dumbbell', technicalDemand: 'low' },
  { id: 'hammer_curl', name: 'Hammer Curl', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 90, isBuiltIn: true, isCompound: false, muscleGroups: ['Biceps'], pattern: 'elbow_flexion', primary: ['Biceps'], secondary: ['Forearms'], lengthPosition: 'mid', equipment: 'dumbbell', technicalDemand: 'low' },
  { id: 'ez_bar_curl', name: 'EZ Bar Curl', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90, isBuiltIn: true, isCompound: false, muscleGroups: ['Biceps'], pattern: 'elbow_flexion', primary: ['Biceps'], secondary: [], lengthPosition: 'mid', equipment: 'barbell', technicalDemand: 'medium' },
  { id: 'single_arm_cable_curl', name: 'Single-Arm Cable Curl', sets: 2, repsMin: 12, repsMax: 15, restSeconds: 60, isBuiltIn: true, isCompound: false, muscleGroups: ['Biceps'], pattern: 'elbow_flexion', primary: ['Biceps'], secondary: [], lengthPosition: 'mid', equipment: 'cable', technicalDemand: 'low' },
  { id: 'preacher_curl', name: 'Preacher Curl (DB or EZ)', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90, isBuiltIn: true, isCompound: false, muscleGroups: ['Biceps'], pattern: 'elbow_flexion', primary: ['Biceps'], secondary: [], lengthPosition: 'lengthened', equipment: 'dumbbell', technicalDemand: 'low' },
  { id: 'concentration_curl', name: 'Concentration Curl', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60, isBuiltIn: true, isCompound: false, muscleGroups: ['Biceps'], pattern: 'elbow_flexion', primary: ['Biceps'], secondary: [], lengthPosition: 'shortened', equipment: 'dumbbell', technicalDemand: 'low' },
  { id: 'spider_curl', name: 'Spider Curl', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60, isBuiltIn: true, isCompound: false, muscleGroups: ['Biceps'], pattern: 'elbow_flexion', primary: ['Biceps'], secondary: [], lengthPosition: 'shortened', equipment: 'dumbbell', technicalDemand: 'low' },
  { id: 'cable_curl', name: 'Cable Curl (straight bar)', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60, isBuiltIn: true, isCompound: false, muscleGroups: ['Biceps'], pattern: 'elbow_flexion', primary: ['Biceps'], secondary: [], lengthPosition: 'mid', equipment: 'cable', technicalDemand: 'low' },
  { id: 'reverse_curl', name: 'Reverse Curl (EZ bar)', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60, isBuiltIn: true, isCompound: false, muscleGroups: ['Biceps'], pattern: 'elbow_flexion', primary: ['Biceps'], secondary: ['Forearms'], lengthPosition: 'mid', equipment: 'barbell', technicalDemand: 'medium' },
  { id: 'bayesian_curl', name: 'Bayesian Cable Curl', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 60, isBuiltIn: true, isCompound: false, muscleGroups: ['Biceps'], pattern: 'elbow_flexion', primary: ['Biceps'], secondary: [], lengthPosition: 'lengthened', equipment: 'cable', technicalDemand: 'low' },

  // ── REAR DELTS ──
  { id: 'face_pull', name: 'Face Pull', sets: 3, repsMin: 15, repsMax: 20, restSeconds: 90, isBuiltIn: true, isCompound: false, muscleGroups: ['Rear Delts', 'Shoulders'], pattern: 'rear_delt_fly', primary: ['Rear Delts'], secondary: ['Back'], lengthPosition: 'shortened', equipment: 'cable', technicalDemand: 'low' },
  { id: 'reverse_pec_deck', name: 'Reverse Pec Deck', sets: 3, repsMin: 15, repsMax: 20, restSeconds: 90, isBuiltIn: true, isCompound: false, muscleGroups: ['Rear Delts'], pattern: 'rear_delt_fly', primary: ['Rear Delts'], secondary: [], lengthPosition: 'shortened', equipment: 'machine', technicalDemand: 'low' },
  { id: 'rear_delt_fly', name: 'Rear Delt Fly (DB)', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60, isBuiltIn: true, isCompound: false, muscleGroups: ['Rear Delts'], pattern: 'rear_delt_fly', primary: ['Rear Delts'], secondary: [], lengthPosition: 'shortened', equipment: 'dumbbell', technicalDemand: 'low' },
  { id: 'band_pull_apart', name: 'Band Pull-Apart', sets: 3, repsMin: 15, repsMax: 25, restSeconds: 60, isBuiltIn: true, isCompound: false, muscleGroups: ['Rear Delts'], pattern: 'rear_delt_fly', primary: ['Rear Delts'], secondary: [], lengthPosition: 'shortened', equipment: 'band', technicalDemand: 'low' },
  { id: 'cable_rear_delt_fly', name: 'Cable Rear Delt Fly', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60, isBuiltIn: true, isCompound: false, muscleGroups: ['Rear Delts'], pattern: 'rear_delt_fly', primary: ['Rear Delts'], secondary: [], lengthPosition: 'shortened', equipment: 'cable', technicalDemand: 'low' },

  // ── QUADS ──
  { id: 'barbell_squat', name: 'Barbell Back Squat', sets: 4, repsMin: 4, repsMax: 6, restSeconds: 180, isBuiltIn: true, isCompound: true, muscleGroups: ['Quads', 'Glutes'], pattern: 'squat', primary: ['Quads', 'Glutes'], secondary: [], lengthPosition: 'lengthened', equipment: 'barbell', technicalDemand: 'high', locked: true },
  { id: 'hack_squat', name: 'Hack Squat', sets: 4, repsMin: 8, repsMax: 10, restSeconds: 120, isBuiltIn: true, isCompound: true, muscleGroups: ['Quads'], pattern: 'squat', primary: ['Quads'], secondary: ['Glutes'], lengthPosition: 'lengthened', equipment: 'machine', technicalDemand: 'low', locked: true },
  { id: 'front_squat', name: 'Front Squat', sets: 4, repsMin: 6, repsMax: 8, restSeconds: 180, isBuiltIn: true, isCompound: true, muscleGroups: ['Quads', 'Glutes'], pattern: 'squat', primary: ['Quads', 'Glutes'], secondary: [], lengthPosition: 'lengthened', equipment: 'barbell', technicalDemand: 'high', locked: true },
  { id: 'goblet_squat', name: 'Goblet Squat', sets: 3, repsMin: 10, repsMax: 15, restSeconds: 90, isBuiltIn: true, isCompound: true, muscleGroups: ['Quads', 'Glutes'], pattern: 'squat', primary: ['Quads', 'Glutes'], secondary: [], lengthPosition: 'lengthened', equipment: 'dumbbell', technicalDemand: 'medium' },
  { id: 'smith_squat', name: 'Smith Machine Squat', sets: 3, repsMin: 8, repsMax: 12, restSeconds: 120, isBuiltIn: true, isCompound: true, muscleGroups: ['Quads', 'Glutes'], pattern: 'squat', primary: ['Quads', 'Glutes'], secondary: [], lengthPosition: 'lengthened', equipment: 'machine', technicalDemand: 'low' },
  { id: 'leg_press', name: 'Leg Press', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 120, isBuiltIn: true, isCompound: true, muscleGroups: ['Quads', 'Glutes'], pattern: 'squat', primary: ['Quads'], secondary: ['Glutes'], lengthPosition: 'lengthened', equipment: 'machine', technicalDemand: 'low' },
  { id: 'leg_extension', name: 'Leg Extension', sets: 3, repsMin: 15, repsMax: 20, restSeconds: 90, isBuiltIn: true, isCompound: false, muscleGroups: ['Quads'], pattern: 'knee_extension', primary: ['Quads'], secondary: [], lengthPosition: 'mid', equipment: 'machine', technicalDemand: 'low' },
  { id: 'bulgarian_split_squat', name: 'Bulgarian Split Squat', sets: 3, repsMin: 8, repsMax: 12, restSeconds: 120, isBuiltIn: true, isCompound: true, muscleGroups: ['Quads', 'Glutes'], pattern: 'lunge', primary: ['Quads', 'Glutes'], secondary: ['Hamstrings'], lengthPosition: 'lengthened', equipment: 'dumbbell', technicalDemand: 'high' },
  { id: 'walking_lunges', name: 'Walking Lunges (DBs)', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 120, isBuiltIn: true, isCompound: true, muscleGroups: ['Quads', 'Glutes'], pattern: 'lunge', primary: ['Quads', 'Glutes'], secondary: ['Hamstrings'], lengthPosition: 'lengthened', equipment: 'dumbbell', technicalDemand: 'high' },
  { id: 'reverse_lunge', name: 'Reverse Lunge (DB or BB)', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90, isBuiltIn: true, isCompound: true, muscleGroups: ['Quads', 'Glutes'], pattern: 'lunge', primary: ['Quads', 'Glutes'], secondary: ['Hamstrings'], lengthPosition: 'lengthened', equipment: 'dumbbell', technicalDemand: 'medium' },
  { id: 'lateral_lunge', name: 'Lateral Lunge', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90, isBuiltIn: true, isCompound: true, muscleGroups: ['Quads', 'Glutes'], pattern: 'lunge', primary: ['Quads', 'Glutes'], secondary: ['Hamstrings'], lengthPosition: 'lengthened', equipment: 'dumbbell', technicalDemand: 'high' },
  { id: 'step_up', name: 'Step-Up (DB or BB)', sets: 3, repsMin: 10, repsMax: 12, restSeconds: 90, isBuiltIn: true, isCompound: true, muscleGroups: ['Quads', 'Glutes'], pattern: 'lunge', primary: ['Quads', 'Glutes'], secondary: ['Hamstrings'], lengthPosition: 'lengthened', equipment: 'dumbbell', technicalDemand: 'medium' },
  { id: 'sissy_squat', name: 'Sissy Squat', sets: 3, repsMin: 10, repsMax: 15, restSeconds: 60, isBuiltIn: true, isCompound: false, muscleGroups: ['Quads'], pattern: 'knee_extension', primary: ['Quads'], secondary: [], lengthPosition: 'lengthened', equipment: 'bodyweight', technicalDemand: 'high' },
  { id: 'box_jump', name: 'Box Jump', sets: 3, repsMin: 5, repsMax: 8, restSeconds: 90, isBuiltIn: true, isCompound: true, muscleGroups: ['Quads', 'Glutes'], pattern: 'jump', primary: ['Quads', 'Glutes'], secondary: [], lengthPosition: 'mid', equipment: 'bodyweight', technicalDemand: 'high' },

  // ── HAMSTRINGS ──
  { id: 'romanian_deadlift', name: 'Romanian Deadlift', sets: 3, repsMin: 8, repsMax: 10, restSeconds: 180, isBuiltIn: true, isCompound: true, muscleGroups: ['Hamstrings', 'Glutes'], pattern: 'hip_hinge', primary: ['Hamstrings', 'Glutes'], secondary: ['Back'], lengthPosition: 'lengthened', equipment: 'barbell', technicalDemand: 'high', locked: true },
  { id: 'sumo_deadlift', name: 'Sumo Deadlift', sets: 3, repsMin: 6, repsMax: 8, restSeconds: 180, isBuiltIn: true, isCompound: true, muscleGroups: ['Hamstrings', 'Glutes', 'Quads'], pattern: 'hip_hinge', primary: ['Hamstrings', 'Glutes'], secondary: ['Back', 'Quads'], lengthPosition: 'lengthened', equipment: 'barbell', technicalDemand: 'high', locked: true },
  { id: 'stiff_leg_deadlift', name: 'Stiff-Leg Deadlift', sets: 3, repsMin: 8, repsMax: 12, restSeconds: 120, isBuiltIn: true, isCompound: true, muscleGroups: ['Hamstrings', 'Glutes'], pattern: 'hip_hinge', primary: ['Hamstrings', 'Glutes'], secondary: ['Back'], lengthPosition: 'lengthened', equipment: 'barbell', technicalDemand: 'high' },
  { id: 'lying_leg_curl', name: 'Lying Leg Curl', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 90, isBuiltIn: true, isCompound: false, muscleGroups: ['Hamstrings'], pattern: 'knee_flexion', primary: ['Hamstrings'], secondary: [], lengthPosition: 'mid', equipment: 'machine', technicalDemand: 'low' },
  { id: 'seated_leg_curl', name: 'Seated Leg Curl', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 90, isBuiltIn: true, isCompound: false, muscleGroups: ['Hamstrings'], pattern: 'knee_flexion', primary: ['Hamstrings'], secondary: [], lengthPosition: 'lengthened', equipment: 'machine', technicalDemand: 'low' },
  { id: 'good_morning', name: 'Good Morning', sets: 3, repsMin: 8, repsMax: 12, restSeconds: 120, isBuiltIn: true, isCompound: true, muscleGroups: ['Hamstrings', 'Glutes'], pattern: 'hip_hinge', primary: ['Hamstrings', 'Glutes'], secondary: ['Back'], lengthPosition: 'lengthened', equipment: 'barbell', technicalDemand: 'high' },
  { id: 'nordic_curl', name: 'Nordic Hamstring Curl', sets: 3, repsMin: 5, repsMax: 8, restSeconds: 120, isBuiltIn: true, isCompound: false, muscleGroups: ['Hamstrings'], pattern: 'knee_flexion', primary: ['Hamstrings'], secondary: [], lengthPosition: 'mid', equipment: 'bodyweight', technicalDemand: 'high' },
  { id: 'glute_ham_raise', name: 'Glute-Ham Raise', sets: 3, repsMin: 8, repsMax: 12, restSeconds: 90, isBuiltIn: true, isCompound: true, muscleGroups: ['Hamstrings', 'Glutes'], pattern: 'knee_flexion', primary: ['Hamstrings'], secondary: ['Glutes'], lengthPosition: 'mid', equipment: 'bodyweight', technicalDemand: 'high' },

  // ── GLUTES ──
  { id: 'hip_thrust', name: 'Hip Thrust (DB or Barbell)', sets: 3, repsMin: 10, repsMax: 15, restSeconds: 90, isBuiltIn: true, isCompound: true, muscleGroups: ['Glutes'], pattern: 'hip_extension', primary: ['Glutes'], secondary: ['Hamstrings'], lengthPosition: 'shortened', equipment: 'dumbbell', technicalDemand: 'medium' },
  { id: 'cable_pull_through', name: 'Cable Pull-Through', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 90, isBuiltIn: true, isCompound: true, muscleGroups: ['Glutes', 'Hamstrings'], pattern: 'hip_hinge', primary: ['Glutes', 'Hamstrings'], secondary: [], lengthPosition: 'lengthened', equipment: 'cable', technicalDemand: 'low' },
  { id: 'glute_kickback', name: 'Glute Kickback (Cable or Machine)', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60, isBuiltIn: true, isCompound: false, muscleGroups: ['Glutes'], pattern: 'hip_extension', primary: ['Glutes'], secondary: [], lengthPosition: 'shortened', equipment: 'cable', technicalDemand: 'low' },
  { id: 'adductor_machine', name: 'Adductor Machine', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60, isBuiltIn: true, isCompound: false, muscleGroups: ['Glutes'], pattern: 'hip_adduction', primary: ['Glutes'], secondary: [], lengthPosition: 'lengthened', equipment: 'machine', technicalDemand: 'low' },
  { id: 'abductor_machine', name: 'Abductor Machine', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60, isBuiltIn: true, isCompound: false, muscleGroups: ['Glutes'], pattern: 'hip_abduction', primary: ['Glutes'], secondary: [], lengthPosition: 'mid', equipment: 'machine', technicalDemand: 'low' },

  // ── CALVES ──
  { id: 'standing_calf_raise', name: 'Standing Calf Raise', sets: 4, repsMin: 15, repsMax: 20, restSeconds: 60, isBuiltIn: true, isCompound: false, muscleGroups: ['Calves'], pattern: 'calf_raise_standing', primary: ['Calves'], secondary: [], lengthPosition: 'lengthened', equipment: 'machine', technicalDemand: 'low' },
  { id: 'seated_calf_raise', name: 'Seated Calf Raise', sets: 4, repsMin: 15, repsMax: 20, restSeconds: 60, isBuiltIn: true, isCompound: false, muscleGroups: ['Calves'], pattern: 'calf_raise_seated', primary: ['Calves'], secondary: [], lengthPosition: 'lengthened', equipment: 'machine', technicalDemand: 'low' },
  { id: 'leg_press_calf_raise', name: 'Leg Press Calf Raise', sets: 3, repsMin: 15, repsMax: 20, restSeconds: 60, isBuiltIn: true, isCompound: false, muscleGroups: ['Calves'], pattern: 'calf_raise_standing', primary: ['Calves'], secondary: [], lengthPosition: 'lengthened', equipment: 'machine', technicalDemand: 'low' },
  { id: 'donkey_calf_raise', name: 'Donkey Calf Raise', sets: 3, repsMin: 15, repsMax: 20, restSeconds: 60, isBuiltIn: true, isCompound: false, muscleGroups: ['Calves'], pattern: 'calf_raise_standing', primary: ['Calves'], secondary: [], lengthPosition: 'lengthened', equipment: 'machine', technicalDemand: 'low' },

  // ── CORE & ACCESSORIES ──
  { id: 'farmer_carry', name: 'Farmer Carry', sets: 3, repsMin: 30, repsMax: 60, restSeconds: 90, isBuiltIn: true, isCompound: true, isCore: true, muscleGroups: ['Core'], pattern: 'carry', primary: ['Core'], secondary: ['Forearms', 'Back'], lengthPosition: 'mid', equipment: 'dumbbell', technicalDemand: 'low' },
  { id: 'dead_hang', name: 'Dead Hang', sets: 3, repsMin: 30, repsMax: 60, restSeconds: 60, isBuiltIn: true, isCompound: false, isCore: true, muscleGroups: ['Core'], pattern: 'hang', primary: ['Forearms'], secondary: ['Core'], lengthPosition: 'mid', equipment: 'bodyweight', technicalDemand: 'low' },
  { id: 'hanging_leg_raise', name: 'Hanging Leg Raise', sets: 3, repsMin: 10, repsMax: 15, restSeconds: 60, isBuiltIn: true, isCompound: false, isCore: true, muscleGroups: ['Core'], pattern: 'spinal_flexion', primary: ['Core'], secondary: [], lengthPosition: 'mid', equipment: 'bodyweight', technicalDemand: 'medium' },
  { id: 'ab_wheel', name: 'Ab Wheel Rollout', sets: 3, repsMin: 8, repsMax: 12, restSeconds: 60, isBuiltIn: true, isCompound: true, isCore: true, muscleGroups: ['Core'], pattern: 'anti_extension', primary: ['Core'], secondary: [], lengthPosition: 'lengthened', equipment: 'bodyweight', technicalDemand: 'medium' },
  { id: 'cable_woodchop', name: 'Cable Woodchop', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60, isBuiltIn: true, isCompound: true, isCore: true, muscleGroups: ['Core'], pattern: 'rotation', primary: ['Core'], secondary: [], lengthPosition: 'mid', equipment: 'cable', technicalDemand: 'low' },
  { id: 'plank', name: 'Plank (weighted)', sets: 3, repsMin: 30, repsMax: 60, restSeconds: 60, isBuiltIn: true, isCompound: false, isCore: true, muscleGroups: ['Core'], pattern: 'anti_extension', primary: ['Core'], secondary: [], lengthPosition: 'mid', equipment: 'bodyweight', technicalDemand: 'low' },
  { id: 'russian_twist', name: 'Russian Twist', sets: 3, repsMin: 15, repsMax: 20, restSeconds: 60, isBuiltIn: true, isCompound: false, isCore: true, muscleGroups: ['Core'], pattern: 'rotation', primary: ['Core'], secondary: [], lengthPosition: 'mid', equipment: 'bodyweight', technicalDemand: 'low' },
  { id: 'cable_crunch', name: 'Cable Crunch', sets: 3, repsMin: 12, repsMax: 15, restSeconds: 60, isBuiltIn: true, isCompound: false, isCore: true, muscleGroups: ['Core'], pattern: 'spinal_flexion', primary: ['Core'], secondary: [], lengthPosition: 'shortened', equipment: 'cable', technicalDemand: 'low' },
]
