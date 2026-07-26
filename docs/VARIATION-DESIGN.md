# Exercise variation & swaps — design notes

**Status:** designed, not built. Parked deliberately until a few real sessions have been
logged on the Stage 1 logging flow (see `ROADMAP.md`). Pick this up cold from this document.

---

## The problem, in Collin's words

> "It's kinda hard for me to add and know which workout best swaps for what because I'm not a
> gym professional. I'm learning, and sometimes I get bored doing the same workout every day.
> I want to do a variation or something."

Three distinct needs hiding in there:

1. **Boredom** — the same six sessions on repeat.
2. **Not knowing what substitutes for what** — the exercise library is 110 items reachable only
   through the program editor's add panel, with no notion of what replaces what.
3. **Wanting to learn** — the feature should teach, not just do.

## The hard constraint: a bad swap is worse than no swap

The audit found that squats and leg presses barely grow rectus femoris, which is why leg
extension now runs twice a week. **If a naive swap feature had offered "leg press" as a
substitute for "leg extension," it would have silently undone that.** Any design here has to
make the wrong choice unavailable rather than merely discouraged.

## What the research constrains (don't re-derive this)

From `PROGRAM-AUDIT.md`:

- **Variety produces no hypertrophy benefit** — Baz-Valle et al. 2019 (*PLOS ONE*
  14(12):e0226989) and Kassiano et al. 2025 (*Res Q Exerc Sport* 96(2):371–81) both found no
  growth difference between varied and constant exercise selection. Baz-Valle *did* find
  **higher intrinsic motivation**. So this feature is justified by **adherence, not growth** —
  which is fine, because adherence is the actual problem.
- **Therefore rotating freely is safe** — but load progression is the thing that must survive.
  Swap so often that no lift accumulates history and progression stalls.
- **Some swaps are genuinely equivalent** and can be offered freely:
  dumbbell vs cable lateral raise (Larsen et al. 2025, *Front Physiol* 16:1611468);
  machines vs free weights generally (Haugen et al. 2023, *BMC Sports Sci Med Rehabil* 15:103;
  Heidel et al. 2022, *J Sports Med Phys Fitness* 62(8):1061–70).
- **Some swaps are known downgrades and must never be offered as equivalents:**
  seated calf raise in place of standing (Kinoshita 2023: gastrocnemius +1.7% vs +12.4%);
  Nordic curl in place of seated leg curl (Maeo 2024: biceps femoris long head +5% vs +19%);
  leg press in place of leg extension (different job entirely — see above).
- **Muscle length is the axis that matters most.** ROM/length effects were larger than
  exercise-selection effects throughout the review. A substitute that doesn't load the target
  muscle at a similar length is not a substitute.
- **Exercise selection is unrankable for some muscles.** No longitudinal trial compares back
  exercises at all. For lats/traps, any reasonable option is as defensible as another — the UI
  should not imply false precision there.

---

## Design

### 1. Library tagging (the enabling work)

Every entry in `EXERCISE_LIBRARY` gains:

| Field | Purpose | Example |
|---|---|---|
| `pattern` | movement pattern, the primary match key | `horizontal_press`, `vertical_pull`, `knee_extension`, `hip_hinge`, `knee_flexion`, `lateral_raise` |
| `primary[]` | muscles the exercise is *for* | `['Chest']` |
| `secondary[]` | meaningfully involved, counted at 0.5 | `['Triceps','Shoulders']` |
| `lengthPosition` | does it load the target muscle stretched? | `lengthened` / `mid` / `shortened` |
| `equipment` | for availability filtering | `barbell`, `dumbbell`, `cable`, `machine`, `bodyweight` |
| `technicalDemand` | Collin is still learning — surface this | `low` / `medium` / `high` |
| `locked` | heavy compounds default to not-swappable | `true` on bench, squat, pull-up, rows, deadlifts |

This replaces the all-ten-muscle-groups hack that inflated the volume math, and finally lets
`calcSetsPerMuscleGroup` weight primary at 1.0 and secondary at 0.5 — the counting method that
fit the data best in Pelland et al. **Do this pass first; everything else depends on it.**

### 2. Substitution rule

A candidate qualifies as **equivalent** when it matches on `pattern`, shares the same
`primary`, and has the same `lengthPosition`. It's offered as **shifts emphasis** when pattern
and primary match but length or joint stress differs — shown in a separate section with a
one-line explanation of the difference. Anything on the known-downgrade list is excluded
entirely (behind a "show everything" escape hatch, with the evidence stated).

Filter by available equipment. Sort by: previously used (most recent weight known) → never
tried → higher technical demand last.

### 3. The swap sheet

```
LEG EXTENSION                                3×15–20
─────────────────────────────────────────────────────
EQUIVALENT — same job, same emphasis
  Leg Extension (machine)              ← current
     last: 90 lb × 18, 17, 15
  Reverse Nordic                       never done
     bodyweight · technical: medium

SHIFTS EMPHASIS — read before picking
  Sissy Squat                          never done
     more knee stress · technical: high

Why these: rectus femoris only loads when the hip
stays extended. Squats and leg presses don't do it —
that's why this exercise is in your program.

     [ Just today ]     [ Replace in program ]
```

Non-negotiables in that sheet:

- **Last weight used per option**, so choosing isn't guesswork. `getLastSessionSets` already
  matches on `exerciseId` with a name fallback, so weight memory across swaps works today.
- **A one-line "why,"** because he asked to learn. Reuse/extend `formGuides.js`.
- **Equivalent vs shifts-emphasis separation** — honest, and it teaches the distinction.
- **Two commit levels:** today-only or permanent.

### 4. Shuffle accessories (the one-tap boredom fix)

A workout-level action that keeps `locked` compounds fixed and re-rolls the isolation slots.
Directly targets "bored of the same workout" without touching the lifts being progressed —
stable compounds, rotating accessories, which is both good practice and what the evidence
permits.

### 5. Variation ≠ a different exercise

Offer all four kinds in one menu. Often the best answer for a lift he's progressing on is one
of the last three:

- **Exercise swap** (above)
- **Rep-range variation** — same lift, heavy vs volume. His A/B days already do this at the
  program level; expose it per exercise.
- **Technique variation** — drop set, rest-pause on the final set. The DB lateral raise already
  does this; it's a name string today, and should become a `technique` field (see backlog).
- **Equipment variation** — dumbbell ↔ cable where the research says it's equivalent. Pure
  novelty at zero cost.

### 6. Guardrails

- Compounds `locked` by default, overridable.
- Per-exercise weight memory so returning after weeks resumes where he left off.
- Churn nudge: if the same slot changes 3 sessions running — *"staying with one lift for a few
  weeks lets you add weight to it."*
- Never let a swap silently reduce the weekly set count for a muscle.

---

## Implementation notes (traps to know about)

- **Today-only swaps must operate on the session, not the program.** `startSession` snapshots
  program exercises into the session, so a today-only swap after the session starts means
  editing that session's exercise entry — and the program must stay untouched.
- **Tombstones already exist.** `migrateProgram` tracks per-day `removedIds`, and
  `ProgramEditor` records/clears them, so permanent swaps won't be undone by a future migration.
- **Equipment availability needs a source.** Either a one-time "what does your gym have" setup
  in Settings, or a "hide this suggestion" that learns. Without it he'll be offered machines he
  doesn't have.
- **Related known bug** (`ROADMAP.md` backlog): only one non-ABS workout per calendar day is
  possible, because `startSession` derives the session id from the calendar day rather than the
  chosen workout. Worth fixing before anything that encourages re-running a session.
- **The ABS picker is currently empty** except Blank/Custom — the day is tagged `['Core']` and
  nothing in the library matched until `isCore` was added to the filter. A real library screen
  supersedes that workaround.

## Phasing

- **A.** Library tagging pass + primary/secondary volume weighting. Gate for everything.
- **B.** Swap sheet on the exercise card, today-only + permanent.
- **C.** Shuffle accessories.
- **D.** Staleness nudges — *"11 sessions of cable pushdown; overhead extension is 9 weeks stale."*
- **E.** Exercise library screen — searchable, with form guide, history and PR per exercise.

## Open decisions

1. **Should a swap default to today-only or permanent?** Leaning today-only: experimenting stays
   consequence-free and the program remains the stable reference. Revisit if most swaps end up
   being kept.
2. How many alternatives to show — 4 is probably right; more becomes the browsing problem this
   feature exists to avoid.
3. Should shuffle be deterministic per week (so a "week" feels coherent) or freely re-rollable?

## Do this before building any of it

Log a handful of real sessions on the Stage 1 logging flow first. It was rebuilt around an
estimate of interaction cost (~105 touches → ~28) that has not yet been tested in a gym. If the
weight header and one-tap rep rows have rough edges, fix those before layering features on top —
the whole reason the previous version was abandoned was in-gym friction, not lack of features.
