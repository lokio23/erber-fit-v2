# Program audit — evidence review, July 2026

Audit of `DEFAULT_PROGRAM` in `src/data/workouts.js` against the current hypertrophy
literature. Goal: maximise muscle gain, natural, trained 2+ years, 6 sessions/week.

**Evidence tiers used below:** [MA] meta-analysis · [RCT] single trial · [PRE] preprint,
not peer reviewed · [SURV] survey of practice · [MODEL] practitioner estimate, not research ·
[⚠] weak, contested, or extrapolated.

---

## 1. What the program actually prescribes

Computed from the program data. "Direct" = sets where the muscle is the exercise's primary
mover. "Fractional" = direct sets + 0.5 per set where the muscle is a secondary mover, which
is the counting method that best fit the data in Pelland et al. Primary/secondary was inferred
from the order of `muscleGroups` in the library (first entry treated as primary).

| Muscle | Direct/wk | Fractional/wk | Sessions/wk | Per-session (fractional) |
|---|---|---|---|---|
| Chest | 16 | 16.0 | 2 | 7.0, 9.0 |
| Shoulders | 13 | 18.0 | 3 | 9.0, 7.5, 1.5 |
| Triceps | 9 | 12.0 | 2 | 6.0, 6.0 |
| Back | 20 | 20.0 | 2 | 10.0, 10.0 |
| Biceps | 10 | 12.0 | 2 | 5.0, 7.0 |
| Rear Delts | 6 | 6.0 | 2 | 3.0, 3.0 |
| Quads | 20 | 21.5 | 2 | 11.5, 10.0 |
| Hamstrings | 12 | 12.0 | 2 | 6.0, 6.0 |
| Glutes | 3 | 12.5 | 2 | 6.0, 6.5 |
| Calves | 8 | 8.0 | 2 | 4.0, 4.0 |
| **Core** | **24** | **24.0** | **4** | 6.0, 6.0, 6.0, 6.0 |

**141 working sets/week across 45 exercise slots**, plus 8 warm-up sets per session.
Sessions: PUSH B 20 sets/6 exercises · PULL B 24/8 · LEGS B 29/9 · PUSH A 18/6 ·
PULL A 24/8 · LEGS A 26/8. Optional ABS day adds 12 more core sets.

Lower-bound session estimate (40s per set + prescribed inter-set rest, ignoring transitions
between exercises and plate changes): 43–58 min of that, ~5 h/week. Real sessions with 8–9
exercises will run meaningfully longer.

---

## 2. The changes worth making

> Sections 2.1–2.3 were written first. Sections 9 and 10 (added after the intensity and
> per-muscle reviews completed) add four more changes, and **upgrade the leg-extension item
> from "add 3 sets" to "run it twice a week"** — it is the highest-confidence change in the
> whole audit. The consolidated list is in section 11.

### 2.1 Core volume is 17% of your entire training week — cut it by two thirds

24 direct core sets/week across 4 sessions is **more than you give chest (16) and nearly
three times what you give triceps (9 direct)**. Core is spread across Pull B, Legs B, Pull A
and Legs A (hanging leg raise, cable woodchop, ab wheel, plank, cable crunch, russian twist),
and stacking the ABS day pushes it to 36.

- [MA] Pelland et al. put the **minimum effective dose for detectable hypertrophy at 4
  fractional sets/week**, with efficiency tiers of 5–10 (high), 11–18 (intermediate) and
  19–29 (low). 24 sets sits in the *low efficiency* band: each further detectable increment
  costs ~10.75 additional sets.
- There is no inverted-U — those sets are not *harmful* — but they are the most expensive,
  lowest-return sets in the program, spent on the muscle group with the least visual payoff.

**Recommendation:** 4–6 direct core sets/week, one or two exercises, 1–2 sessions. Keep one
loaded flexion movement (cable crunch or ab wheel) and drop the rest. This frees ~18 sets/week
to redistribute or simply removes ~18 sets of fatigue and session time.

### 2.2 LEGS A has no leg extension, so rectus femoris is undertrained

Squats, leg press and split squats all involve simultaneous hip and knee extension, which
means rectus femoris (the only quad crossing the hip) stays relatively short and grows poorly.

- [RCT] Kubo et al. 2019, *Eur J Appl Physiol* 119:1933–42 — full vs half squat: **neither
  produced significant rectus femoris growth.**
- [RCT] Kinoshita et al. 2026, *Med Sci Sports Exerc* 58(7):1566–80 — knee extension vs leg
  press: **rectus femoris +13.2% vs +1.1%.**
- [RCT] Kassiano et al. 2026, *J Strength Cond Res* 40(4):367–76 — back squat vs leg
  extension: leg extension favoured for rectus femoris at all three measured sites.

LEGS A currently runs squat, RDL, leg press, lying leg curl, Bulgarian split squat, standing
calf raise + 2 core. LEGS B has the only leg extension in the program (3 sets).

**Recommendation:** add 3 sets of leg extension to LEGS A. Swap it in for one of the core
slots you're cutting — no net time cost.

### 2.3 Swap the lying leg curl for a seated leg curl

- [RCT] Maeo et al. 2021, *Med Sci Sports Exerc* 53(4):825–37 — seated (hip-flexed) vs prone
  leg curl, **whole hamstrings +14% vs +9%**. Hip flexion lengthens the hamstrings at the
  knee-flexion movement, and training at longer muscle lengths favours growth.

LEGS A uses `lying_leg_curl`; LEGS B already uses `seated_leg_curl`.

**Recommendation:** make both seated. Zero cost, free hypertrophy.

---

## 3. What your program already gets right

Worth stating explicitly, because these are the things most programs get wrong:

- **Overhead triceps work.** PUSH A has overhead cable extension. [RCT] Maeo et al. 2023,
  *Eur J Sport Sci* 23(7):1240–50 — overhead vs pushdown, **triceps long head +28.5% vs
  +19.6% (d=0.61)**. You have overhead *and* skullcrushers (also shoulder-flexed) *and*
  pushdowns.
- **Incline dumbbell curls.** Trains the biceps in a shoulder-extended, lengthened position.
- **Both hamstring functions.** Hip extension (RDL, sumo deadlift) *and* knee flexion (leg
  curls). Programs commonly do only one.
- **Both calf positions.** Standing (knee extended, gastrocnemius) on LEGS A and seated
  (knee flexed, soleus) on LEGS B. [RCT] Kinoshita et al. 2023, *Front Physiol* 14:1272106 —
  standing vs seated calf raise, **lateral gastrocnemius +12.4% vs +1.7%**; soleus similar
  between conditions. You need the standing variant and you have it.
- **Direct lateral raises**, twice weekly. Pressing does not sufficiently train lateral delts.
  [RCT] Larsen et al. 2025, *Front Physiol* 16:1611468 — dumbbell vs cable lateral raise, no
  meaningful difference, so either is fine.
- **Direct rear delt work** (face pull, reverse pec deck) rather than assuming rows cover it.
- **Vertical and horizontal pulling** both present, across 20 direct back sets.
- **Rep ranges spanning heavy compounds (4–6) and higher-rep isolation (15–20)**, which is
  consistent with hypertrophy being achievable across a wide load range when sets are taken
  near failure.
- **Incline pressing** for the clavicular pec, on both push days.

Volume per muscle is otherwise reasonable. Chest 16, back 20, quads 20, shoulders 13 direct /
18 fractional, hamstrings 12 — all sit inside or just above the 12–20 direct-set range from
[MA] Baz-Valle et al. 2022, *J Hum Kinet* 81:199–210, and above the 8–17 direct sets/muscle
observed in [SURV] Baz-Valle et al. 2026, *Sports* 14(1):20, a survey of 56 drug-tested
competitive bodybuilders (who trained ~4.8 days/week, most muscles 1–3×/week).

Per-session volumes are also sane: your heaviest is 11.5 fractional quad sets on LEGS B,
right at the ~11 fractional sets/session point where [PRE] Remmert et al. 2025 (SportRxiv,
**not peer reviewed**) found further per-session sets stop producing detectable additional
hypertrophy.

**Minor, optional:** calves at 8 direct sets is the lightest area relative to its potential;
rear delts at 6 could go to 8–9. No direct trap or forearm work — only matters if you want it.

---

## 4. Your "3 PPL then a day off" question — supported

Running PPL on a repeating 4-day rotation (each muscle every 4 days, ~1.75×/week) instead of
a fixed 6-on/1-off week costs you **essentially nothing in hypertrophy**:

- [MA] Pelland et al. — frequency's effect on hypertrophy had a credible interval containing
  zero (posterior probability of a positive slope only 91.3%), described as "compatible with
  negligible effects." Volume is what drives growth.
- [MA] Schoenfeld, Grgic & Krieger 2019, *J Sports Sci* 37(11):1286–95 — 25 studies: "strong
  evidence that resistance training frequency does not significantly or meaningfully impact
  muscle hypertrophy when volume is equated." This supersedes Schoenfeld 2016, which is the
  source of the widely repeated "2×/week is better" claim.
- [RCT] Saric et al. 2019, *J Strength Cond Res* 33(7S):S122–29 — trained men, 6 weeks,
  volume-equated **3×/week vs 6×/week: no significant differences** in any strength or
  thickness measure.

Two honest caveats:

1. **Strength**, unlike size, *does* improve with frequency in the current data ([MA] Pelland
   et al., 100% posterior probability; [RCT] Pedersen et al. 2024, *Eur J Sport Sci*
   24(5):557–65 — squat 1RM +15 kg at 4×/week vs +8 kg at 1×/week, p=0.01, while vastus
   lateralis thickness did not differ, p=0.57). If maximal strength matters to you, higher
   frequency has a small edge.
2. At 1.75 sessions/week per muscle instead of 2.0, **weekly volume drops ~12%** unless you
   add a little per session.

The app already supports this: because you pick the workout rather than inheriting the
calendar day, a drifting 4-day rotation works without any code change.

Also relevant, on missing days: [RCT] Yang et al. 2018, *Front Physiol* 9:725 found ~24h
between sessions was not inferior to 48–72h for strength or body composition, and DOMS is a
poor proxy for adaptation ([Review] Schoenfeld & Contreras 2013, *Strength Cond J* 35(5):16–21).
Doubling up to catch a missed day is unlikely to hurt you.

---

## 5. Two things in the app that aren't evidence-based

### 5.1 The MEV/MRV volume zones

The Progress tab labels <10 sets "Low", 10–20 "Optimal", >20 "High / Near MRV". The MEV/MAV/MRV
framework has **no peer-reviewed validation** — a targeted search found only promotional and
secondary sources, and MRV in particular has never been operationalised in a published study.
The 10–20 band traces to Baz-Valle et al. 2022, which is **six studies** in its quantitative
analysis, young trained men only, with five limitations the authors list themselves.

Pelland et al. found **no plateau and no inverted-U** — growth continues past 20 sets, just
less efficiently. So ">20 = High" implying a risk of overreach is not supported.

**Recommendation:** relabel as efficiency rather than safety — e.g. "below minimum", "high
efficiency", "diminishing returns" — and stop implying that exceeding 20 sets is harmful.
Core should get its own much lower target rather than sharing the 10–20 band.

### 5.2 The 6-week deload reminder

Both efficacy trials that exist show deloads are **neutral for hypertrophy**:

- [RCT] Coleman et al. 2024, *PeerJ* 12:e16777 — trained lifters, 9 weeks, a week of complete
  cessation: all six muscle-thickness sites showed trivial differences with credible intervals
  spanning zero, and the deload group was **worse on lower-body strength** (squat 1RM
  between-group −3.6 kg).
- [RCT] Pancar et al. 2026, *Sci Rep* — a volume-reduced deload: no interactions, all
  confidence intervals included zero. Neither helped nor hurt.
- The "every ~6 weeks" figure comes from [SURV] Bell et al. 2024, *Sports Med Open* 10:26 —
  a survey of *what 246 athletes do* (every 5.6 ± 2.3 weeks), not a test of whether it works.

**Recommendation:** keep the deload feature but make it autoregulated rather than a calendar
prompt — offer it when logged performance stalls or RPE climbs, not on a 6-week timer. Your
current implementation (halve sets, keep frequency and exercises) matches observed practice
and is the version *without* a measured downside; full cessation is the one with a strength cost.

Note the volume bars still credit secondary muscles at full value (bench press gives triceps
full credit), so triceps and shoulders read high. The primary/secondary split in Stage 2 of
the roadmap fixes that.

---

## 6. What actually limits your rate of gain

Ranked by evidence quality, and all of it outranks the program tweaks above:

1. **Protein 1.6–2.2 g/kg/day.** [MA] Morton et al. 2018, *BJSM* 52(6):376–84 — breakpoint at
   **1.62 g/kg/day**, beyond which added protein does not further increase fat-free mass;
   effect is *larger* in resistance-trained subjects (+0.75 kg). [MA] Tagawa et al. 2021,
   *Nutrition Reviews* 79(1):66–79 — marginal return drops roughly threefold above ~1.3 g/kg.
   At 190 lb (86 kg) that's **~140–190 g/day**. Highest-confidence recommendation here.
2. **A modest surplus, not a large one.** [RCT] Helms et al. 2023, *Sports Med Open* 9(1):102 —
   trained lifters on maintenance vs +5% vs +15%: **no benefit to muscle thickness or squat 1RM
   from the larger surplus**, and more skinfold gain. Body-mass gain rate predicted fat gain
   (R²=0.49) far better than muscle. [Review] Slater et al. 2019, *Front Nutr* 6:131 suggests
   ~360–480 kcal/day as a starting point and notes no evidence-based consensus exists.
3. **Avoid severe sleep restriction.** [RCT] Lamon et al. 2021, *Physiol Rep* 9(1):e14660 —
   one night of total deprivation cut muscle protein synthesis 18%. [RCT] Saner et al. 2020,
   *J Physiol* 598(8):1523–36 — five nights at 4h reduced myofibrillar protein synthesis, though
   exercise partly rescued it. But a mild shortfall may not matter: [RCT] Borba et al. 2024,
   *Sleep Science* 17(3) found habitual 6h15m sleepers gained strength and arm muscle area
   equivalently to 7h47m sleepers. "Under 8 hours kills gains" is overstated.
4. **Proximity to failure.** [MA] Robinson et al. 2024, *Sports Med* 54(9):2209–31 — hypertrophy
   improves as sets get closer to failure, on a flattening curve; practical range **0–5 RIR**.
   Your cards say "stop 1–2 reps before failure," which is well inside the supported range.
5. **Progression method doesn't matter much.** [RCT] Plotkin et al. 2022, *PeerJ* 10:e14142 —
   trained lifters, adding load vs adding reps produced equivalent hypertrophy and strength.
   Your double-progression rule ("hit the top of the range on all sets, then add weight") is
   validated by this, and neither approach is superior.

**Realistic ceiling.** [MODEL] Lyle McDonald's experience-based estimates: ~10–12 lb year 1,
5–6 lb year 2, 2–3 lb year 3, minimal after. [MODEL] Alan Aragon's: 0.25–0.5% bodyweight/month
for advanced trainees. Both are **practitioner estimates, not research** — and note a
frequently circulated citation attributing Aragon's model to a 2012 *JSCR* paper appears to be
fabricated; the model comes from his own publications. For you, 2+ years in at 190 lb, expect
roughly **0.5–1 lb/month at best, declining year over year**. No split, deload schedule, or
exercise swap raises that ceiling. Consistency across years is the whole game — which is why
the logging work in `ROADMAP.md` Stage 1 matters more to your results than anything in this file.

---

## 7. Methodological caveats you should weigh

- Effect sizes in this literature sit near measurement noise. Pelland et al. used a smallest
  detectable effect of **2.05%** for hypertrophy, estimated indirectly from control-group
  variance in an external dataset. Volume and frequency explained only **16–26%** of variance
  (R² marginal); individual response, effort, diet and exercise selection dominate.
- Hypertrophy here means ultrasound/MRI thickness and cross-sectional area. No biopsy, no
  fibre-level data. Studies using DXA lean mass have produced opposite-direction findings.
- Mean intervention length across the volume literature is **10.4 ± 4.5 weeks**. Nothing
  addresses multi-year programming, which is your actual timescale.
- Samples are ~79% male, mean age ~25.
- [RCT] Kinoshita 2026 and [RCT] Kassiano 2026 carry 2026 publication dates — recent, so
  independent replication is limited.
- **Four Barbalho et al. papers are formally retracted**, including the two most often cited to
  argue that isolation work adds nothing on top of compounds. Discount any advice resting on them.
- Per-session volume evidence rests substantially on a **preprint** (Remmert et al. 2025).
- [MA] Vigotsky et al. 2022, *Sports Med* 52(2):193–99 — **EMG amplitude is not a validated
  predictor of hypertrophy**, so ignore exercise rankings built on EMG "activation" data.
- [MA] Haugen et al. 2023, *BMC Sports Sci Med Rehabil* 15:103 — machines and free weights
  produce similar hypertrophy. Equipment choice is a logistics decision.
- [RCT] Baz-Valle et al. 2019, *PLOS ONE* 14(12):e0226989 — randomised exercise variation
  produced **no hypertrophy difference** vs fixed exercises, but higher motivation. Relevant to
  the Stage 2 swap feature: rotating exercises for boredom is free, but don't expect it to add
  growth on its own, and don't rotate so much that you lose load progression.

## 8. Gaps — now closed

The two gaps flagged in the first pass have been filled. Findings in sections 9 and 10.
Remaining genuinely unverified items are listed at the end of section 10.

---

## 9. Intensity, load, rest, tempo, techniques

### 9.1 Your rep ranges are correct

[MA] Schoenfeld BJ, Grgic J, Ogborn D, Krieger JW 2017, *J Strength Cond Res* 31(12):3508–23
(PMID 28834797) — 21 studies, low load defined as ≤60% 1RM vs high load >60%: **"changes in
measures of muscle hypertrophy were similar between conditions,"** while **1RM strength gains
significantly favoured high load** (isometric strength showed no difference). Conclusion:
"maximal strength benefits are obtained from the use of heavy loads while muscle hypertrophy can
be equally achieved across a spectrum of loading ranges."

Your 4–6 on heavy compounds, 8–12 on secondary compounds, 12–20 on isolation is a sound
distribution — the heavy work buys strength (which raises the loads you can use everywhere
else) and the growth stimulus is load-insensitive as long as sets are taken near failure.

### 9.2 Your "stop 1–2 reps before failure" cue is well chosen

[MA] Robinson ZP, Pelland JC, Remmert JF, Refalo MC, Jukic I, Steele J, Zourdos MC 2024,
*Sports Med* 54(9):2209–31 (DOI 10.1007/s40279-024-02069-2) — 55 hypertrophy studies and 67
strength studies. Hypertrophy improves as sets get closer to failure but on a **flattening
slope**; strength is relatively insensitive to proximity to failure. Practical range **0–5 RIR**.

1–2 RIR sits in the high-return part of that curve without paying the recovery cost of training
to absolute failure on every set — which matters at your 141 sets/week.

### 9.3 The 60-second rests on isolation are the one prescription to change

[RCT] Schoenfeld BJ, Pope ZK, Benik FM, … Henselmans M, Krieger JW 2016, *J Strength Cond Res*
30(7):1805–12 (PMID 26605807) — 21 **resistance-trained** men, 8 weeks, 3 sets of 8–12RM,
**1-minute vs 3-minute** inter-set rest. Longer rest produced **significantly greater 1RM squat
and bench press**, **significantly greater anterior thigh thickness**, and a trend toward greater
triceps thickness (p=0.06). Muscle endurance did not differ.

Your 180s on heavy compounds and 120s on secondary compounds are well supported. But you have
**60-second rests on cable pushdown, single-arm cable curl, both calf raises, and all core work**.
That is the condition that underperformed in the only trial run in trained lifters. The likely
mechanism is simply fewer reps on subsequent sets, i.e. less effective volume.

**Recommendation:** raise the 60s prescriptions to **90–120s**. Costs a few minutes per session;
it is the cheapest evidence-based upgrade in the program.

### 9.4 Tempo — nothing to change, because you don't prescribe one

[MA] Schoenfeld BJ, Ogborn DI, Krieger JW 2015, *Sports Med* 45(4):577–85 (PMID 25601394) —
8 studies: **hypertrophy is similar across repetition durations from 0.5 to 8 seconds**, with
volitionally very slow tempos (>10s per rep) appearing inferior. Wide latitude, so the absence
of tempo prescriptions in the app is fine. The one thing to avoid is deliberate super-slow reps.

### 9.5 Your drop set is fine, but it isn't buying extra growth

[MA] Sødal LK, Kristiansen E, Larsen S, van den Tillaar R 2023, *Sports Med Open* (PMID 37523092)
— 6 studies, 142 participants. Drop sets SMD **0.555** (95% CI 0.357–0.921) vs traditional sets
**0.437** (95% CI 0.266–0.608); **between-group difference 0.155, 95% CI −0.199 to 0.509,
p=0.392 — not significant**. But drop sets achieved this in **one-half to one-third of the time**.

So the DB lateral raise drop set is a legitimate **time-saver**, not a growth enhancer. Keep it
because it's efficient, not because it does more.

### 9.6 The single largest lever: range of motion at long muscle lengths

This came through as the biggest measured effect anywhere in the review, and it is a *cueing*
change rather than a programming change:

- [MA] Strey B, Irigoyen A, McMahon G, Pinto RS 2026, *Sport Sci Health* 22(1):1–14 — long-muscle-
  length partials beat short-length partials for total growth, **ES 0.283, p=0.036**, 8 studies.
- [MA] Wolf M, Androulakis-Korakakis P, Fisher J, Schoenfeld B, Steele J 2023, *Int J Strength Cond*
  3(1) — full vs partial ROM overall is a trivial **SMD 0.12** favouring full ROM; long-length
  partials vs full ROM **SMD −0.28** with a wide interval.
- [MA] Varovic D, Wolf M, Schoenfeld BJ, Steele J, Grgic J, Mikulic P 2025, *Int J Sports Med*
  46:1027–36 — muscle length does **not** meaningfully shift *regional* growth distribution
  (SMDs 0.04–0.09, 12 studies).

Read together: training at long muscle lengths produces **more total growth, not differently
shaped growth**. Ignore "sculpting" claims; protect the stretched portion of every rep.

The within-exercise ROM effects measured in individual trials are larger than most
exercise-selection effects — calves **+15.2% vs +6.7%**, biceps **+8.9% vs +3.4%** (section 10).

---

## 10. Per-muscle exercise selection — biceps, back, quads, hamstrings, calves

### 10.1 Quads — rectus femoris is your one real coverage gap

Three independent datasets agree that compound knee extension does not grow rectus femoris:

- [RCT] Kubo K et al. 2019, *Eur J Appl Physiol* 119:1933–42 (PMID 31230110) — 10 wk, full vs half
  squat. Knee extensors +4.9% vs +4.6% (NS); glutes +6.7% vs +2.2%; adductors +6.2% vs +2.7%;
  **rectus femoris and hamstrings showed no significant change in either group.**
- [RCT] Kinoshita M et al. 2026, *Med Sci Sports Exerc* 58(7):1566–80 (PMID 41630124) — 12 wk,
  knee extension vs leg press. **RF +13.2% vs +1.1%** (p≤0.001); vasti comparable.
- [RCT] Kassiano W et al. 2026, *J Strength Cond Res* 40(4):367–76 (PMID 41379528) — 8 wk, 63
  women, back squat vs leg extension. **Leg extension greater RF at all three sites**
  (proximal +11.4% vs +2.0%, mid +12.3% vs +5.7%, distal +17.5% vs +7.9%, all p<0.001).
  **Squat greater distal vastus lateralis** (+18.2% vs +11.2%) — so you want both.

You run four compound quad movements (barbell squat, hack squat, leg press, Bulgarian split
squat) and **one** weekly leg extension. **Move leg extension to both leg days.** Highest-
confidence change in the audit.

The four compounds are redundant: no trial distinguishes hack squat from leg press from squat for
quad growth, machines equal free weights ([MA] Haugen et al. 2023; [MA] Heidel et al. 2022), and
[RCT] Amanuma et al. 2025, *J Bodyw Mov Ther* 45:562–68 found lunge ≈ inclined leg press.
**Drop one to fund the leg-extension frequency.** Keep a deep squat pattern — depth is supported
for glutes and adductors ([RCT] Bloomquist et al. 2013, *Eur J Appl Physiol* 113(8):2133–42;
Kubo 2019) even though the vasti case is weaker than usually claimed.

### 10.2 Calves — the seated calf raise is the weakest item in your program

[RCT] Kinoshita M et al. 2023, *Front Physiol* 14:1272106 (PMID 38156065) — 12 wk, within-subject
standing (knee extended) vs seated (knee flexed 90°): lateral gastrocnemius **+12.4% vs +1.7%**,
medial gastrocnemius **+9.2% vs +0.6%**, and **soleus +2.1% vs +2.9% — no seated advantage**.

That contradicts the standard "seated for soleus" prescription, which rests on acute muscle
*swelling* data (Kassiano et al. 2023, *J Strength Cond Res* 37(9):e438–43), and swelling is not
hypertrophy. Caveat: soleus grew only 2–3% in both conditions, so the trial may lack sensitivity.

Keep two calf slots — [RCT] Kassiano W et al. 2024, *Int J Sports Med* 45:739–47 (PMID 38684187)
found **12 sets/wk beat 6** for lateral gastrocnemius (+14.3% vs +8.1%) and soleus (+12.7% vs
+6.7%) — but make both effective. **Swap seated → a second standing raise**, and emphasise the
bottom stretch: [RCT] Kassiano W et al. 2023, *J Strength Cond Res* 37(9):1746–53 (PMID 37015016)
found stretched-position partials gave medial gastrocnemius **+15.2% vs +6.7% for full ROM and
+3.4% for the top half**. One of the largest ROM effects on record.

### 10.3 Hamstrings — keep both curls, but the lying one is the weaker

- [RCT] Maeo S et al. 2021, *Med Sci Sports Exerc* 53(4):825–37 (PMID 33009197) — 12 wk,
  within-subject seated vs prone leg curl, MRI. Whole hamstrings **+14% vs +9%**; biarticular
  heads +8–24% vs +4–19%; **monoarticular short head +10% vs +9% (NS)** — precisely as the
  hip-flexion mechanism predicts.
- [RCT] Maeo S et al. 2024, *Med Sci Sports Exerc* 56(10):1893–1905 (PMID 38857522) — hip-flexed
  lengthened-state eccentrics vs Nordic curls: hamstrings **+18% vs +11%**, **biceps femoris long
  head +19% vs +5%**.
- [RCT] Morin et al. 2025, *J Strength Cond Res* 39(9):924–32 (PMID 40644669) — Nordic vs
  stiff-leg deadlift: semitendinosus **+24.3% (Nordic)** vs semimembranosus **+11.2% (SDL)**.
  Different exercise types bias different heads, which justifies keeping both hip-extension and
  knee-flexion work.

**Do not add Nordic curls for hypertrophy** — +5% BFlh vs +19% is a large gap and your seated
leg curl already fills that role better. (Nordics have a real injury-prevention literature; that
is a different outcome.)

### 10.4 Biceps — you have four exercises where the evidence supports two or three

[RCT] Attarieh et al. 2025, *Eur J Sport Sci* 25(4):e12279 (PMID 40082069) — 10 wk, within-subject
preacher curl (shoulder flexed) vs Bayesian cable curl (shoulder extended): biceps thickness
**6–7% vs 9%**, **no significant difference at any site**; brachialis 10% vs 8% (NS). So the
"shoulder-extended curls grow the long head more" claim has **no demonstrated advantage** (n=15,
underpowered — read as unproven, not disproven).

What *does* matter is ROM: [RCT] Sato et al. 2021, *Front Physiol* 12:734509 — extended-range
(0–50°) vs flexed-range (80–130°) curls, biceps thickness **+8.9% vs +3.4%**. Keep the incline
DB curl for its lengthened position.

**Not supported:** supination grip comparisons (no longitudinal trial exists), long-head vs
short-head targeting by exercise (no trial has separately measured them), and hammer/reverse
curls for brachialis (brachialis already grows 8–10% from ordinary supinated curls).

### 10.5 Back — the weakest-evidenced area in the entire literature

**No longitudinal hypertrophy trial compares back exercise variations.** Four separate database
queries returned zero trials measuring latissimus dorsi, teres major, or trapezius growth as a
function of exercise choice. Vertical vs horizontal, wide vs narrow grip, "rows for thickness /
pulldowns for width," "straight-arm pulldown isolates the lats" — all rest on EMG and
biomechanics, and [MA] Vigotsky AD et al. 2022, *Sports Med* 52(2):193–99 established that
**acute EMG amplitude is not a validated predictor of hypertrophy**.

Your six back exercises are therefore neither validated nor condemned. Choose on loadability,
comfort and ROM. Don't believe the redundancy achieves regional targeting. **Shrugs:** no trial
isolates their contribution to trapezius growth, so omitting them is defensible.

### 10.6 Retracted work you may encounter

**Four Barbalho et al. papers are formally retracted**, including the two most cited to argue
isolation exercises add nothing on top of compounds (PMID 29781936, *J Strength Cond Res*;
PMID 31072272, *Eur J Sport Sci*). The surviving non-retracted test is Gentil et al. 2013,
*Appl Physiol Nutr Metab* 38(3):341–44 (upper body, null, untrained, 10 weeks), which conflicts
with the within-subject [RCT] Mannarino et al. 2021, *J Strength Cond Res* 35(10):2677–81 (elbow
flexors **+11.06% curl vs +5.16% row**). Contested — but discount anything resting on the
retracted papers.

### 10.7 Variety adds motivation, not growth — which reframes Stage 2

- [RCT] Baz-Valle E et al. 2019, *PLOS ONE* 14(12):e0226989 — randomised exercise variation
  produced **no hypertrophy difference** vs fixed exercises, but **higher intrinsic motivation**.
- [RCT] Kassiano W et al. 2025, *Res Q Exerc Sport* 96(2):371–81 (PMID 39388663) — systematically
  varied vs constant exercises, 70 women: quad thickness +7.5–19.3% vs +7.8–17.7%, NS.

The swap feature in `ROADMAP.md` Stage 2 is still worth building — but its justification is
**adherence, which is your actual problem**, not extra hypertrophy. Don't rotate so much that
you lose load progression.

### 10.8 Still unverified

No longitudinal trial was found for: back/lat or trapezius exercise selection, hack squat
comparisons, Bulgarian split squat specifically, supinated vs neutral grip curls, long- vs
short-head biceps growth by exercise, heavy vs light loading for soleus (the "soleus needs 20+
reps" claim is mechanism-only), or adding leg extension to a squat program (the case is
inferential from the head-to-head trials). Records dated 2026 were read via database abstract
summaries rather than full text. Also not reached: a rest-interval *meta-analysis* (only the 2016
trial), and myo-reps/rest-pause and superset trials specifically — [MA] Tsartsapakis et al. 2026,
*J Funct Morphol Kinesiol* (PMID 41718208) covers advanced systems but its numbers weren't
retrieved. Stronger By Science and MASS were unreachable (HTTP 403/paywall) throughout.

---

## 11. Consolidated change list

**Program data (`src/data/workouts.js`), in confidence order:**

| # | Change | Evidence |
|---|---|---|
| 1 | Leg extension **1×/wk → 2×/wk** (both leg days) | Kinoshita 2026, Kassiano 2026, Kubo 2019 |
| 2 | **Core 24 → ~6** direct sets/wk | Pelland et al. efficiency tiers |
| 3 | Drop one of leg press / hack squat to fund #1 | No trial distinguishes them; variety null |
| 4 | Lying leg curl → **seated** leg curl | Maeo 2021 (+14% vs +9%) |
| 5 | Seated calf raise → **second standing** raise | Kinoshita 2023 (+12.4% vs +1.7% gastroc) |
| 6 | **60s rests → 90–120s** on isolation and core | Schoenfeld 2016 (trained men, 3 min > 1 min) |
| 7 | Optionally trim biceps 4 → 3, keep incline DB curl | Attarieh 2025 (shoulder position NS) |
| 8 | Do **not** add Nordics or shrugs | Maeo 2024; no shrug trial exists |

**App changes:**

| # | Change | Reason |
|---|---|---|
| 9 | Reframe MEV/MRV zone labels as efficiency, not safety; give Core its own lower target | MEV/MAV/MRV has no peer-reviewed validation; Pelland found no inverted-U |
| 10 | Deload triggers on stalled performance, not a 6-week timer | Coleman 2024, Pancar 2026 — deloads neutral for hypertrophy |
| 11 | Add stretch-position cues to form guides (currently ~20 of ~110 exercises) | ROM at long muscle lengths is the largest measured lever in the review |

Keep as-is: rep ranges (4–6 / 8–12 / 12–20), the 1–2 RIR cue, 180s and 120s rests, the lateral
raise drop set (efficient, not superior), RDL + sumo deadlift + seated leg curl, both vertical
and horizontal pulling, direct lateral and rear delt work, incline pressing, no tempo prescription.
