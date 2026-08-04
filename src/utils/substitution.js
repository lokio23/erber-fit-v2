import { EXERCISE_LIBRARY } from '../data/workouts'
import { getLastSessionSets } from './calculations'

// Substitutes that are measurably worse for the muscle the slot exists to train.
// These are excluded outright, not just ranked lower — a swap feature that can
// offer a downgrade is worse than no swap feature.
const EXCLUDED_SUBS = {
  seated_leg_curl: { nordic_curl: 'Nordic curls grew the biceps femoris 5% vs 19% for seated curls (Maeo 2024)' },
  lying_leg_curl: { nordic_curl: 'Nordic curls grew the biceps femoris far less than machine curls (Maeo 2024)' },
  leg_extension: { leg_press: 'Squats and leg presses barely grow the rectus femoris — that muscle is why this slot exists' },
  standing_calf_raise: { seated_calf_raise: 'Seated raises grew the gastrocnemius 1.7% vs 12.4% standing (Kinoshita 2023)' },
  donkey_calf_raise: { seated_calf_raise: 'Seated raises leave the gastrocnemius nearly untrained (Kinoshita 2023)' },
  leg_press_calf_raise: { seated_calf_raise: 'Seated raises leave the gastrocnemius nearly untrained (Kinoshita 2023)' },
}

// One-line "why these" per pattern — the teaching layer of the swap sheet.
const PATTERN_WHY = {
  horizontal_press: 'Pressing away from the chest — chest does the work, triceps and front delts assist.',
  incline_press: 'Pressing up and away hits the upper chest fibers that flat pressing misses.',
  vertical_press: 'Pressing overhead — all pressing paths grow the delts about equally; pick one you can load.',
  dip: 'A press through a deep stretch — leaning forward shifts it to chest, upright to triceps.',
  chest_fly: 'Arms sweep together with elbows nearly fixed — isolates chest with no triceps limit.',
  lateral_raise: 'Raising out to the side targets the side delt; cable versions keep tension at the bottom.',
  front_raise: 'Front-delt isolation — usually redundant if you press, but harmless variety.',
  upright_row: 'Pulling up along the body works side delts and traps together.',
  elbow_extension: 'Straightening the elbow — overhead versions load the triceps long head at a stretch, pushdowns at the squeeze.',
  vertical_pull: 'Pulling down from overhead — the lat builder. No study ranks back exercises; any of these is defensible.',
  horizontal_row: 'Pulling toward the torso — mid-back, lats, and rear delts. Row angle shifts emphasis slightly.',
  pullover: 'Arms sweep down with elbows fixed — lats in a deep stretch, no biceps limit.',
  shrug: 'Straight up-and-down for the upper traps.',
  deadlift: 'Heavy hinge from a rack or floor — whole posterior chain.',
  elbow_flexion: 'Curling — arm-behind-body versions (incline, Bayesian) load the biceps at long length, which grew ~2.5× more in trials.',
  rear_delt_fly: 'Pulling the arms apart against resistance — rear delts, the group pressing never covers.',
  squat: 'Knee-and-hip bend under load — quads and glutes. Depth matters more than which variant.',
  lunge: 'Single-leg knee-and-hip work — adds balance demand and a deep stretch on the front leg.',
  knee_extension: 'Extending the knee with the hip fixed — the only pattern that fully trains the rectus femoris. Squats do not do this.',
  hip_hinge: 'Hips back, knees soft — hamstrings and glutes at long muscle length, the highest-value stretch in the review.',
  knee_flexion: 'Curling the heel to the glutes — seated versions train the hamstrings at longer length than lying (14% vs 9% growth).',
  hip_extension: 'Driving the hips forward — glutes at peak squeeze, complements stretched hinge work.',
  hip_adduction: 'Squeezing the legs together — inner thigh.',
  hip_abduction: 'Pushing the legs apart — glute med, hip stability.',
  calf_raise_standing: 'Straight-knee raises train the gastrocnemius — the calf muscle you can see. Full stretch at the bottom drove 15% vs 7% growth.',
  calf_raise_seated: 'Bent-knee raises only train the deep soleus — not a substitute for standing work.',
  jump: 'Explosive hip and knee extension — power, not hypertrophy.',
  carry: 'Loaded walking — grip, trunk, and upper back endurance.',
  spinal_flexion: 'Curling the spine or raising the legs against resistance — the ab builder.',
  rotation: 'Rotating the trunk under load — obliques.',
  anti_extension: 'Resisting the spine arching — deep core, hardest at full reach.',
  hang: 'Grip and shoulder decompression under bodyweight.',
}

const LENGTH_LABEL = {
  lengthened: 'loads the muscle at a deep stretch',
  mid: 'loads the muscle through the middle of its range',
  shortened: 'loads the muscle at the squeeze',
}

const DEMAND_ORDER = { low: 0, medium: 1, high: 2 }

function libEntry(exerciseId) {
  return EXERCISE_LIBRARY.find(e => e.id === exerciseId && !e.isWarmup) || null
}

function sharesPrimary(a, b) {
  return (a.primary || []).some(m => (b.primary || []).includes(m))
}

// A one-line honest description of how a same-pattern candidate differs.
function emphasisNote(current, candidate) {
  const parts = []
  if (candidate.lengthPosition !== current.lengthPosition) {
    parts.push(LENGTH_LABEL[candidate.lengthPosition])
  }
  const dropped = (current.primary || []).filter(m => !(candidate.primary || []).includes(m))
  if (dropped.length > 0) parts.push(`less ${dropped.join(' & ').toLowerCase()}`)
  return parts.join(' · ')
}

// Options for swapping out `exerciseId`, honestly split into equivalents
// (same pattern, same primary muscles, same muscle-length position) and
// emphasis shifts (same pattern and primaries, different length position).
// Known downgrades are excluded entirely. Returns null for untagged/custom
// exercises, and for locked compounds unless includeLocked is set.
export function getSwapOptions(exerciseId, sessions, { includeLocked = false } = {}) {
  const current = libEntry(exerciseId)
  if (!current || !current.pattern) return null
  if (current.locked && !includeLocked) return { locked: true, equivalent: [], shiftsEmphasis: [], why: PATTERN_WHY[current.pattern] }

  const excluded = EXCLUDED_SUBS[exerciseId] || {}

  const annotate = (entry) => {
    const lastSets = getLastSessionSets(sessions, entry.id, entry.name)
    return {
      ...entry,
      lastSets,
      neverTried: lastSets.length === 0,
      note: emphasisNote(current, entry),
    }
  }

  const rank = (a, b) => {
    if (a.neverTried !== b.neverTried) return a.neverTried ? 1 : -1
    return DEMAND_ORDER[a.technicalDemand] - DEMAND_ORDER[b.technicalDemand]
  }

  const candidates = EXERCISE_LIBRARY.filter(e =>
    !e.isWarmup &&
    e.id !== exerciseId &&
    e.pattern === current.pattern &&
    sharesPrimary(current, e) &&
    !excluded[e.id]
  )

  const equivalent = candidates
    .filter(e => e.lengthPosition === current.lengthPosition)
    .map(annotate).sort(rank).slice(0, 4)
  const shiftsEmphasis = candidates
    .filter(e => e.lengthPosition !== current.lengthPosition)
    .map(annotate).sort(rank).slice(0, 3)

  return {
    locked: !!current.locked,
    equivalent,
    shiftsEmphasis,
    why: PATTERN_WHY[current.pattern] || null,
    excludedNote: Object.values(excluded)[0] || null,
  }
}
