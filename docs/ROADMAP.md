# Erber Fit — Roadmap

## Why this exists

Between 2026-03-21 and 2026-06-05 there are 25 logged sessions, then a seven-week gap.
The training continued; the logging didn't. The data shows why:

- 5 of 25 sessions have **zero** sets logged (START tapped, nothing recorded).
- Sessions trail off partway through — 5 of 7 exercises, 6 of 8, 2 of 8.
- RPE entries decay to zero (11, 15, 13, 8, 5, 1, … 0).
- The notes field has been used **zero** times in 25 sessions.
- Only 8 of 25 sessions have `completedAt`, because COMPLETE WORKOUT rarely gets tapped.

Two causes, and both have to be fixed for either to matter:

1. **Logging costs too much.** ~5 touches per set × ~21 sets, on a phone, mid-workout, with a
   keyboard covering the card. Weight is re-typed on every set because `SetLogger` initializes
   its inputs once and never updates them.
2. **The payoff is broken or false.** Streak and weekly workout counts key off the rarely-set
   `completedAt`, so they read ~zero even during the densest training. The PR badge is
   structurally unreachable. Volume is inflated because every core exercise credits all ten
   muscle groups. Weekly-sets labels are dated to the wrong week.

Training style that drives the design: **straight sets — the same weight for every set of an
exercise.**

---

## Stage 1 — The in-gym loop

One work session, two commits. Goal: a full session logged in ~28 touches instead of ~105,
with no keyboard, and metrics that tell the truth.

### Commit A — logging redesign

- [x] `ExerciseCard`: weight moves to a **header control** for the whole exercise, with −5/+5
      steppers, prefilled from last session's weight or the progression suggestion.
- [x] `SetLogger` becomes a **rep row**: reps prefilled from the previous set *in this session*
      (falling back to last session, then to target max), ±1 stepper, one large confirm tap.
- [x] Fixes the stale-prefill bug structurally — weight is entered once per exercise, not per set.
- [x] Warm-ups: a single **"done"** tick per exercise. No weight, no reps. They feed no metric.
- [x] Remove the notes UI. Leave stored notes on historical sessions intact.
- [x] Rest timer restarts between sets with equal rest (`App.jsx` needs a run id alongside the
      duration; `RestTimer`'s reset effect currently keys only on `seconds`, so logging a second
      set at the same rest interval never resets it).
- [x] Edit pencil targets the workout on screen. `TodayWorkout.jsx` passes `dayKey={selectedDay}`
      while displaying `program[selectedWorkoutKey]`, so editing PUSH A on a Saturday opens PULL A.

### Commit B — honest metrics

Visibly changes every number on the Progress tab. Separate commit so it can be reviewed alone.

- [x] Streak and workouts-this-week count sessions with **logged sets**, not `completedAt`.
- [x] Auto-set `completedAt` once the target sets are logged, so the flag stops being a lie.
- [x] PR badge works: exclude the live session from the PR baseline in `ExerciseCard`
      (today `findPR` includes the set being tested, so the comparison can never be true).
- [x] PRs rank by **estimated 1RM**, not raw weight — 185×6 (e1RM 222) should outrank 190×1 (196).
- [x] Fix volume inflation: add a `Core` muscle group and stop tagging core exercises with all
      ten groups in `src/data/workouts.js`. (Primary/secondary weighting deferred to Stage 2,
      where the library gains those fields.)
- [x] `WeeklySetsTrend` week labels use `getWeekStart` instead of the leftover Friday-based
      `(getDay() + 2) % 7` at `ProgressCharts.jsx:333`.
- [x] Minimal sync guard: on sign-in, union sessions by id and prefer the copy with more logged
      sets, rather than letting remote overwrite local wholesale.

### Nice to have if the session has room

- [ ] Post-workout summary: volume vs last time, PRs hit, sets completed.
- [x] Demote RPE to opt-in — now one tap behind an RPE button instead of always on screen.

---

## Stage 1.5 — Evidence alignment (from `PROGRAM-AUDIT.md`)

- [x] Program revised: leg extension on both leg days, core 24 → 6 sets/week, leg press
      dropped, lying → seated leg curl, seated → standing calf raise at 10 sets/week,
      all 60s rests → 90s. 141 → 125 sets/week, max 9 → 7 exercises per session.
- [x] `migrateProgram` rewritten — immutable, per-day `removedIds` tombstones so deletions
      stick, declarative revision specs so a migration can change rests and remove
      exercises (not just add them), and new defaults inserted in order.
- [x] `useLocalStorage` takes a `transform`, so migration runs once on load rather than
      on every render.
- [x] Volume zones reframed as efficiency, not safety; per-muscle bands (Core 4–12).
- [x] Deload autoregulated via `isProgressStalled` instead of a 6-week timer.
- [ ] **Stretch-position cues in the form guides.** Range of motion at long muscle lengths
      was the largest measured effect in the whole review — calves +15.2% vs +6.7%, biceps
      +8.9% vs +3.4%, hamstrings +14% vs +9% — and it's a cueing change, not a programming
      one. Form guides currently cover ~20 of ~110 exercises. Highest-value content work
      in the app.

---

## Stage 2 — Exercise variety

Note from the audit: exercise variation produced **no hypertrophy benefit** in two RCTs
(Baz-Valle 2019; Kassiano 2025) but did improve intrinsic motivation. So this stage is
justified by **adherence**, which is the actual problem — not by extra growth. Don't rotate
so much that load progression is lost.


Separate session. Depends on the library schema change, which touches every exercise definition.

- [ ] Retag `EXERCISE_LIBRARY` with `pattern`, `equipment`, `primary[]`, `secondary[]`,
      replacing the all-ten-muscle-groups hack.
- [ ] **Swap button** on each exercise card: 5–6 same-pattern alternatives, each showing the
      weight you last used for it. Choose "today only" or "permanent."
- [ ] **Exercise library screen** — searchable and filterable, with form guide, your history,
      and your PR per exercise. Today those ~110 exercises are only reachable inside the program
      editor's add panel, filtered to the day's muscle groups (which is also why the ABS picker
      comes up empty — nothing is tagged `Core`).
- [ ] Staleness nudges: "11 sessions of Cable Pushdown — Overhead Extension is 9 weeks stale."

---

## Backlog

Ordered by value, not urgency.

- [ ] Per-exercise history sheet, one tap from the card.
- [ ] Plate calculator.
- [ ] Techniques as data (drop set, myo-reps, rest-pause, cluster, tempo) instead of encoded in
      exercise names like "DB Lateral Raise drop set".
- [ ] Warm-up weights computed from working weight (40/60/80%).
- [ ] Bodyweight-aware loading for dips and pull-ups. `settings.bodyweight` is collected and
      currently consumed nowhere.
- [ ] Superset grouping (A1/A2).
- [ ] Consistency heatmap.
- [ ] Mesocycle blocks that rotate accessories every 4–6 weeks.

### Known bugs not scheduled above

- [ ] `migrateProgram` re-adds exercises you deleted and mutates the state object in place.
      Needs deletion tombstones and immutable construction.
- [ ] Only one non-ABS workout per calendar day is possible — `startSession` derives the session
      id from the calendar day, not the chosen workout, and bails if it exists.
- [ ] Kilograms are broken end to end: `SetLogger` shows a converted suggestion beside a raw-lbs
      last weight, and `logSet` stores whatever is typed without converting back to lbs.
- [ ] Deload sessions always read "partial" in History (logged sets compared against pre-deload
      `targetSets`), and the History dot ignores `completedAt` entirely.
- [ ] Dead code: `needsOverload` / `isWeightStagnant` computed at `ExerciseCard.jsx:65`, never rendered.
- [ ] `getInitialProgram()` runs on every render — it's an argument to `useLocalStorage`, so every
      render parses the program and writes it back to localStorage.
- [ ] Service worker precaches `/` and `/index.html` but the app is served from `/erber-fit-v2/`;
      cache name `erberfit-v1` is never bumped; fonts have no offline fallback.
- [ ] PIN auth derives the password deterministically from the PIN, so 4-digit PINs are enumerable.
- [ ] No tests. `src/utils/calculations.js` is pure functions and the obvious place to start.
