// How to enter the weight for an exercise.
//
// The app only ever compares an exercise to itself — progression, PRs and e1RM are
// all per-exercise — so a consistent convention matters far more than an accurate
// absolute load. The point of these notes is to stop the same exercise being logged
// two different ways across sessions.
//
// Where an exercise is genuinely ambiguous (a calf raise might be a pin machine, a
// Smith machine or plate-loaded), say so and ask for consistency rather than
// inventing a rule.

export const CONVENTIONS = {
  barbell: 'Log the total including the bar',
  dumbbell_pair: 'Log ONE dumbbell, not the pair',
  dumbbell_single: 'Log the dumbbell you’re holding',
  pin: 'Log the number on the pin',
  plates: 'Log the plates you added, both sides together — not the sled',
  machine: 'Log the pin number or plates added — just stay consistent',
  added: 'Log ADDED weight only — leave 0 for bodyweight',
  bodyweight: 'Bodyweight — leave the weight at 0',
  seconds: 'Enter seconds in the reps field',
}

// Explicit where the name would guess wrong or say nothing.
const BY_ID = {
  // Barbell
  bench_press: 'barbell', incline_barbell_press: 'barbell', decline_bench_press: 'barbell',
  close_grip_bench: 'barbell', floor_press: 'barbell', barbell_squat: 'barbell',
  front_squat: 'barbell', romanian_deadlift: 'barbell', sumo_deadlift: 'barbell',
  stiff_leg_deadlift: 'barbell', rack_pull: 'barbell', good_morning: 'barbell',
  barbell_row: 'barbell', pendlay_row: 'barbell', standing_ohp: 'barbell',
  barbell_shrug: 'barbell', upright_row: 'barbell', hip_thrust: 'barbell',
  landmine_press: 'barbell',

  // Plate-loaded sleds
  hack_squat: 'plates', leg_press: 'plates', smith_squat: 'plates',

  // Ambiguous machines
  t_bar_row: 'machine', standing_calf_raise: 'machine', seated_calf_raise: 'machine',
  leg_press_calf_raise: 'machine', donkey_calf_raise: 'machine',
  chest_supported_row: 'machine', machine_chest_press: 'machine',

  // Pin machines / cables the name doesn't flag
  seated_leg_curl: 'pin', lying_leg_curl: 'pin', face_pull: 'pin',
  leg_extension: 'pin', lu_raise: 'dumbbell_pair', band_pull_apart: 'bodyweight',
  glute_kickback: 'pin', adductor_machine: 'pin', abductor_machine: 'pin',
  straight_arm_pulldown: 'pin', neutral_grip_pulldown: 'pin',

  // Dumbbell pairs the name doesn't flag
  hammer_curl: 'dumbbell_pair', walking_lunges: 'dumbbell_pair',
  bulgarian_split_squat: 'dumbbell_pair', reverse_lunge: 'dumbbell_pair',
  lateral_lunge: 'dumbbell_pair', step_up: 'dumbbell_pair', farmer_carry: 'dumbbell_pair',
  spider_curl: 'dumbbell_pair', preacher_curl: 'dumbbell_pair',
  arnold_press: 'dumbbell_pair', rear_delt_fly: 'dumbbell_pair',
  plate_front_raise: 'dumbbell_single', goblet_squat: 'dumbbell_single',
  svend_press: 'dumbbell_single', meadows_row: 'dumbbell_single',

  // Bodyweight, optionally loaded
  weighted_pullup: 'added', chin_up: 'added', chest_dip: 'added', tricep_dip: 'added',
  push_up: 'added', hanging_leg_raise: 'added', glute_ham_raise: 'added',
  diamond_pushup: 'bodyweight', inverted_row: 'bodyweight', sissy_squat: 'bodyweight',
  nordic_curl: 'bodyweight', ab_wheel: 'bodyweight', box_jump: 'bodyweight',
  russian_twist: 'added', cable_woodchop: 'pin',

  // Held for time — the reps field is seconds
  plank: 'seconds', dead_hang: 'seconds', wu_dead_hang: 'seconds',
}

// Name-based fallback. Deliberately narrow: a wrong note is worse than none, so
// generic words like "curl", "press", "raise" and "row" are NOT matched here —
// they appear in free-weight and machine exercises alike.
function inferKey(exercise) {
  const n = (exercise.name || '').toLowerCase()
  if (/\bez bar\b|barbell/.test(n)) return 'barbell'
  if (/single-arm|one-arm|concentration/.test(n)) return /cable|machine/.test(n) ? 'pin' : 'dumbbell_single'
  if (/dumbbell|\bdb\b/.test(n)) return 'dumbbell_pair'
  if (/cable|pulldown|pushdown|crossover|pec deck|machine|pull-through/.test(n)) return 'pin'
  if (/\bplank\b|dead hang|carry/.test(n)) return 'seconds'
  return null
}

export function getLoadNote(exercise) {
  if (!exercise) return null
  const key = BY_ID[exercise.id] || inferKey(exercise)
  return key ? CONVENTIONS[key] : null
}
