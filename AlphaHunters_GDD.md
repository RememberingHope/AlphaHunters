# AlphaHunters — Game Design Document (GDD)

**Genre:** Educational action–tracing game  
**Audience:** Children ages 4–7 (early writers/readers)  
**Platforms:** Windows PC / Chromebooks / Mac (HTML5), optional tablet/touch laptops  
**Tech:** JavaScript + HTML5 Canvas (or PixiJS), WebAudio, IndexedDB/LocalStorage  
**Pedagogy Goals:** Letter formation (start point, direction, stroke order), recognition (upper/lower), fluency (speed/accuracy under gentle time pressure)

---

## 0) Design Brief — Updated (Level-Based Difficulty & Upgrades)

- **Progression gets harder every level.** Each new **Player Level** slightly tightens encounter requirements (shorter ideal time windows, slightly stricter direction checks, quicker bot races, and a bit more letterling movement).
- **On Level-Up, pick 1 of 3 upgrades.** The game presents three randomly-drawn, age-appropriate upgrades from curated pools. Upgrades help counteract rising difficulty by improving **speed**, **reach**, **sprint**, or **tracing precision/assistance**.
- **Encounters scale to require growth.** As the world gets a little tougher, children feel motivated to choose upgrades that match their play style (e.g., more **mobility** to reach encounters, more **reach** to tag letterlings, or more **focus/precision** to meet higher accuracy/direction thresholds). Scaling is **gentle** and **adaptive**, never punitive.

---

## 1) Learning Objectives & Success Criteria

### 1.1 Learning Outcomes
- **Formation:** Player traces each English letter with correct start, direction, and approximate shape.
- **Recognition:** Player matches uppercase ↔ lowercase; optional phonics (letter name/sound).
- **Fluency:** Reduced time per letter while maintaining accuracy (≥70/100 target).

### 1.2 Mastery Definition (per letter)
- **Bronze:** 3 successful traces (≥60).  
- **Silver:** 3 consecutive ≥70 within the last 10 attempts.  
- **Gold:** 3 consecutive ≥85 within the last 10 attempts **and** direction correctness ≥90% average.

### 1.3 Success Metrics (product/learning)
- Avg time to Bronze (per letter): 3–6 attempts  
- Avg time to full lowercase mastery (Silver): 4–6 sessions of 10 minutes  
- Session retention goal: 2+ sessions/week

---

## 2) Core Fantasy & Theme

- **Theme:** “Alphabet Island.” Cheerful terrains with wandering “letterlings” (creatures shaped like letters).  
- **Fantasy:** Be a hunter-collector of letters—absorb letterlings by tracing them correctly; assemble a parade of pet letters.

---

## 3) Game Loop

### 3.1 Macro Loop (Session)
1. **Explore** world; collect orbs; spot bots and letterlings.  
2. **Engage** encounters (Trace Challenge or Sprint Contest).  
3. **Resolve** score, XP, coins, and letter mastery; occasionally level up → **Choose 1 of 3 upgrades**.  
4. **Progress** unlocks; pets; cosmetics; dashboard updates.  
5. **Wrap** with end-of-session summary + daily badge.

### 3.2 Micro Loop (Encounter)
- **Trigger:** Collide with letterling (Trace) or bot (Sprint).  
- **Trace Panel:** Hollow letter with start spark + arrows (adaptive hints).  
- **Draw:** Touch/mouse stroke(s).  
- **Score:** Accuracy + Direction + Speed → reward → close panel.

---

## 4) Controls

- **Movement:**  
  - Touch: drag finger; character follows.  
  - Mouse: hold LMB to move toward cursor; optional WASD/Arrows.  
- **Trace:** Draw in panel; right-click/long-press toggles helper hints.  
- **UI:** Large buttons; voice prompts; low text.

---

## 5) Content & Progression

### 5.1 Letter Release Order (adjustable)
- **Set A (round forms):** a, A, c, C, o, O  
- **Set B (curves + tails):** d/D, g/G, q/Q, e/E  
- **Set C (line + cross):** l/L, t/T, i/I, f/F  
- **Set D (angles):** v/V, w/W, y/Y, x/X, z/Z  
- **Set E (tricky):** b/B, p/P, h/H, k/K, m/M, n/N, r/R, s/S, u/U, j/J

**Unlock rule:** Start with a/A, c/C, o/O. When **avg score ≥70** across current set **and** at least **Bronze** on each letter, unlock the next set. Uppercase unlocks when lowercase sibling reaches Bronze (toggle-able).

### 5.2 Player Level & XP
- **XP curve:** `XP_to_level(N) = 100 + 30 * N`  
- **Awards:** Absorb ≥60: 15 XP; ≥80: 25 XP; ≥90: 35 XP; Sprint win: 30 XP.  
- **Level-Up Choices:** On each level-up, present **3 upgrades** from pools (see §6).

### 5.3 Economy
- **Coins (cosmetic only):** Hats 100–200; trails 150–300; pet skins 120–240.  
- **Earnings:** 5–10 coins per success; 25 for Sprint win; 100 for daily badge.

---

## 6) Level-Up: Upgrades (Pick 1 of 3)

Upgrades are kid-friendly, icon-led, and explained via short voice prompts. Pools ensure variety without overwhelming choice.

### 6.1 Categories & Examples
**Mobility**
- **Swift Shoes** (+8% move speed).  
- **Long Sprint** (+1.5s sprint duration).  
- **Quick Start** (faster acceleration from rest).

**Reach**
- **Letter Magnet** (+12% orb/letterling attract radius).  
- **Long Arms** (+15% collision reach to start encounters).  
- **Start Boost** (on collision, immediate 10% time bonus to the next trace).

**Focus & Precision**
- **Stability Field** (slight input smoothing; reduces jitter).  
- **Guide Spark+** (start spark persists longer; clearer arrow hints).  
- **Calm Timer** (+15% to speed bonus window; gives a little more time).

**Scoring Helpers**
- **Kind Curves** (+10% tolerance on curvature mismatch, capped).  
- **Arrow Bonus** (+5 direction score when starting at the correct spark).  
- **Perfect Chase** (+5 total score on Perfects; encourages mastery).

**Utility**
- **Mini Map** (shows nearest letterlings/bots).  
- **Pet Cheer** (pets occasionally give a small, temporary time bonus after a success).  
- **Practice Memory** (Practice Lab remembers last 3 tough letters for quick access).

> **Design note:** We keep upgrades positive/assistive; no punitive effects.

### 6.2 Rarity & Selection
- **Common** (Mobility/Reach/Focus) = 70% pool.  
- **Uncommon** (Scoring Helpers) = 25% pool.  
- **Rare** (Utility) = 5% pool.  
- Each level-up rolls 3 items with at most one Rare. Never repeats the same upgrade twice in a row.

### 6.3 Stacking & Caps
- Multiplicative stacking with soft caps (e.g., total move speed bonus capped at +30%; total time-window leniency +30%). When cap reached, the upgrade converts to coins (+75) and shows a friendly note.

---

## 7) Difficulty & Adaptation

### 7.1 Per-Level Global Scaling (Gentle)
At each new level **N** (starting at Level 2), the world tightens slightly. Values stack but are capped to remain kid-friendly.

| System | Base | Per-Level Change | Cap |
|---|---|---:|---:|
| **Trace: best time window** | letter-specific (e.g., “o” 1500ms) | −1.5% per level | −20% total |
| **Trace: max time window** | letter-specific (e.g., “o” 3000ms) | −1.0% per level | −20% total |
| **Direction threshold** | avg cos ≥ 0.50 | +0.01 per level | 0.65 |
| **Letterling roam speed** | 100% | +1.5% per level | +20% |
| **Bot race pace** | player median | −1.0% time per level | −15% |
| **Encounter density** | 12–18 | +1 letterling every 2 levels | 20 total |

> **Impact:** To keep succeeding, children can pick **Mobility/Reach** to engage faster and **Focus/Precision** to keep meeting trace thresholds as they tighten.

### 7.2 Adaptive Tutor (Per-Letter)
- 2 fails: show animated ghost path.  
- 3 fails: add dot checkpoints; extend max window +10% **for that attempt**.  
- 4+ fails: relax direction threshold by −0.05 and extend time window +10% **for that attempt**.  
- On 3 Gold in a row: gradually fade hints; tighten best-time target by −5% (never below global cap).

### 7.3 Bot Fairness
- If the player loses two Sprints in a row, next Sprint uses a friendlier target (`1.15 ×` player median) and displays encouraging feedback.

---

## 8) Encounters

### 8.1 Trace Challenge (Single Letter)
**UI & Flow:** Full-screen panel; start spark; directional arrows; optional ghost path. **Buttons:** Retry, Practice, Skip (2/session).

**Scoring (0–100):**
- **Accuracy (0–60):** Procrustes/Hausdorff vs template.  
- **Direction (0–25):** Cosine similarity of motion vectors.  
- **Speed (0–15):** Between **best** and **max** time windows (both scale by level as in §7.1).

**Outcomes:**  
- 90–100: Perfect (35 XP; 15 coins; confetti).  
- 70–89: Great (25 XP; 10 coins).  
- 60–69: Good (15 XP; 5 coins).  
- <60: Almost (5 XP; offer help).

**Mastery:** Updates Bronze/Silver/Gold per §1.2.

### 8.2 Sprint Contest (Race vs Bot)
- **Prompt:** 3–5 letters from the player’s unlocked pool.  
- **Bot time:** Player median of last 10 traces × difficulty factor (scales up by level, capped).  
- **Win:** +30 XP; +25 coins; +10% move speed for 30s.  
- **Lose:** +10 XP; encouragement.

---

## 9) World & Bots

### 9.1 Arena
- **Size:** 3000×3000 units; camera follow; soft borders.  
- **Spawners:** 12–18 letterlings (scales to 20); 3–5 bots; orbs cluster near likely paths.

### 9.2 Bots (Fake Multiplayer)
- **Look:** Nameplates, varied cosmetics to imply real players.  
- **AI:** Wander → Chase Letterling → Challenge Player → Flee (if player buffed).  
- **Tuning:** Base speed ≈ player ±5%; challenge cooldown 30–60s; emotes on outcomes.

---

## 10) Tracing & Recognition

### 10.1 Input Pipeline
1. Capture (x,y,t).  
2. Smooth (moving average).  
3. Simplify (RDP 2–4px).  
4. Normalize (translate+scale).  
5. Resample (N=64).

### 10.2 Templates & Tolerances
- Per-letter stroke templates with start points and directions.  
- Start proximity threshold: 8% bounding box.  
- Direction acceptance: avg cos ≥0.50 (per-level scaling up to 0.65 per §7.1).  
- Stroke order checked only after Silver; never the sole reason for failure.

---

## 11) Rewards, Pets, Achievements

- **Pets:** Gold mastery unlocks a tiny letter pet. Pet cap: 6 base; +2 at L7; +2 at L14.  
- **Achievements:** First Five (5 Bronze), Speedy Scribe (3 Perfects in a row), Mix & Match (win Sprint with mixed case), Alphabet Champion (full Silver).  
- **Certificate:** Printable when all letters reach Silver.

---

## 12) UX, Accessibility, & Safety

- Large buttons; voice guidance; color-blind safe.  
- Left-handed mode; Calm Corner; Auto-pause after 30s idle.  
- No ads, no chat, offline; Grown-up Gate for settings.

---

## 13) Modes

1. **Adventure** (default): Exploration + encounters + bots.  
2. **Practice Lab:** Pick letter; slow motion; unlimited hints; no bots.  
3. **Sprint Mode:** Short races (3–5 letters).  
4. **Boss Parade:** Endgame; minimal hints; mixed-case sequences.

---

## 14) Session Design

- **Recommended:** 8–12 minutes.  
- **Daily Badge:** 6 encounters ≥60 → 100 coins + summary card.  
- **Break Prompt:** After 15 minutes continuous play.

---

## 15) Data & Dashboard

- IndexedDB save: attempts, best/avg score, time, streaks, mastery, upgrades chosen.  
- Dashboard: per-letter trends; suggested practice; CSV/JSON export.

---

## 16) Audio & Art

- Thick-outline letterlings; clear sparks/arrows; 60 FPS.  
- SFX: start ping, curve chime, perfect fanfare, soft near-miss.  
- Voice: “Start here,” “Great curve,” “You did it!”  
- Music: gentle loops; volume sliders; duck during trace.

---

## 17) Tech Architecture

- **Render:** HTML5 Canvas or PixiJS; rAF loop; fixed-step physics.  
- **Audio:** WebAudio.  
- **Input:** Pointer Events unify mouse/touch.  
- **Persistence:** IndexedDB (Dexie.js recommended) + LocalStorage backup.  
- **FSM:** World, Encounter, Pause, Summary.

**Core Modules:** `WorldManager`, `BotAI`, `TracePanel`, `Recognizer`, `Progression`, `Economy`, `AudioManager`, `SaveManager`, `Dashboard`.

**Recognizer Pseudocode:**
```js
function scoreTrace(raw, template, bestMs, maxMs) {
  const pts = resample(normalize(simplify(smooth(raw))), 64);
  const shape = 60 * (1 - clamp01(procrustes(pts, template.allPoints)));
  const dir = 25 * avgCosine(pts, template.allDirs);
  const t = duration(raw);
  const speed = 15 * clamp01((maxMs - t) / (maxMs - bestMs));
  let total = clamp(0, 100, shape + dir + speed);
  if (template.checkOrder) total += orderBonus(pts, template.strokes);
  return clamp(0, 100, total);
}
```

---

## 18) Balancing Tables

### 18.1 Time Targets (ms) — Base (pre-scaling)
| Letter | best | max |
|---|---:|---:|
| o/O | 1500 | 3000 |
| c/C | 1500 | 3000 |
| a/A | 1700 | 3200 |
| e/E | 1700 | 3200 |
| l/L | 1200 | 2500 |
| t/T | 1600 | 3000 |
| m/M | 2200 | 3600 |
| n/N | 2000 | 3500 |
| s/S | 1900 | 3400 |
| g/G | 2000 | 3500 |

### 18.2 Per-Level Scaling (apply to base)
- bestMs *= (1 − 0.015)^(level−1) [cap −20%]  
- maxMs  *= (1 − 0.010)^(level−1) [cap −20%]  
- dirThreshold = min(0.50 + 0.01*(level−1), 0.65)

---

## 19) First Run, Pause, Summary

- **First Run:** avatar → handedness → move/touch tutorial → trace “o”.  
- **Pause:** Resume / Practice Lab / Settings / Quit.  
- **Summary:** Coins/XP; letters mastered; upgrades chosen; suggested practice (3 letters with lowest avg).

---

## 20) Roadmap

**MVP (6–8 weeks):** World, 1 bot, 6 letters (a/A, c/C, o/O), trace scoring (shape+direction+speed), Bronze/Silver, coins, pets, save/load, level-up with 6 upgrades.  
**Beta:** Full alphabet, adaptive hints, Sprint mode, dashboard, shop, expanded upgrade pool.  
**v1.0:** Boss Parade, certificate export, accessibility suite, deeper bot variety, parental reports.

---

### Notes on Child-Centered Difficulty
Level-based scaling is **subtle** and **paired with choice**. Kids always have a viable path: pick **Mobility/Reach** to engage more easily, or **Focus/Precision** to meet higher trace thresholds. Adaptive hints keep the experience **supportive**—no hard fail states.
