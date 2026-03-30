# Shop Upgrade Reference - Coin Toss Game

This document provides detailed examples of the 5+ upgrades planned for the shop system (S02).

---

## Upgrade Categories

### 1. Probability Boosters (Direct Odds Improvement)

#### head_chance_boost_1
- **Cost:** 10 money
- **Effect:** +1% head probability (10% → 11%)
- **Stackable:** Yes (each purchase adds +1%)
- **Example:** Buy 3x = 13% heads, 87% tails
- **Why:** Direct path to better odds; first upgrade target

#### head_chance_boost_5
- **Cost:** 80 money
- **Effect:** +5% head probability
- **Stackable:** Yes
- **Example:** Buy 1x = 15% heads, 85% tails
- **Why:** Better value than small boosts; mid-game upgrade

---

### 2. Money Multipliers (Earning Enhancement)

#### money_multiplier_2x
- **Cost:** 50 money
- **Effect:** All money earned is 2x (if normally earn 1 per head, now earn 2)
- **Stackable:** Yes (2x then 2x again = 4x)
- **Example:** Buy 2x = earn 4 money per heads instead of 1
- **Why:** Compounds with head boosts; accelerates upgrade progression

---

### 3. Streak Bonuses (Win Condition Enhancement)

#### streak_bonus_forgive
- **Cost:** 75 money
- **Effect:** Tails only reset streak to 8 (instead of 0); need only 2 more heads to win
- **Stackable:** No (one-time purchase; doesn't stack further)
- **Benefit:** Huge late-game boost; bridge to 10 heads if streak is high
- **Why:** Late-game checkpoint; reduces luck variance

---

### 4. Reroll Mechanics (Risk Reduction)

#### reroll_free
- **Cost:** 30 money
- **Effect:** Get one free reroll per session (redo a toss once)
- **Stackable:** Yes (each purchase grants another reroll)
- **Example:** Buy 1x = use reroll on a tail; pretend it didn't happen
- **Why:** Reduces frustration; gives player agency

---

### 5. Special Abilities

#### auto_toss_5
- **Cost:** 200 money
- **Effect:** Automatically toss 5 times (batch toss); results applied sequentially
- **Stackable:** Yes (buy again for 5 more auto tosses)
- **Example:** Buy 1x, activate, game tosses 5 times, resolve all outcomes
- **Why:** Quality-of-life upgrade; speeds up gameplay in late sessions

---

## Balancing Philosophy

### Cost Progression
```
Tier 1 (First upgrades):    10–30 money
Tier 2 (Second wave):       50–80 money
Tier 3 (Late-game):        150–250 money
```

### Expected Player Progression
```
Session start:
  Toss 10–15 times → earn ~10–15 money
  → Buy head_chance_boost_1 (cost 10)
  → Toss 20–30 more times
  → Earn enough for money_multiplier_2x (cost 50) or more boosts

Mid-session:
  With 2x money multiplier + head boost, progression accelerates
  → Unlock higher-cost upgrades (200+ money)

Late-session:
  With ~13–15% head chance + 2x money, reach 10 heads within 50–100 tosses
```

### Win-Rate Heuristic
- **Base:** 10% heads = ~1 head per 10 tosses = ~100 tosses to win (without streak resets)
- **With +1% boost:** 11% heads = ~1 per 9 tosses
- **With +5% boost + 2x money:** 15% heads = ~1 per 6.7 tosses
- **Late-game (15% + streak forgive):** Estimated 80–200 tosses to first win

---

## Upgrade Interaction Examples

### Scenario: Player with 3 Upgrades
```
Owned upgrades:
- head_chance_boost_1 (x2 purchases) = +2% to odds → 12%
- money_multiplier_2x (x1 purchase) = earn 2x money per head

Next 10 tosses: assume 1 head, 9 tails
- 1 head toss: earn 2 money (1 base × 2x multiplier)
- Total earnings: 2 money

With 12% head rate over 100 tosses:
- Expected ~12 heads
- Expected earnings: 12 × 2 = 24 money
- Enough to unlock another boost or multiplier
```

---

## Design Principles

1. **Synergy:** Upgrades should feel good together (probability boost + money multiplier compound)
2. **Progression:** Each new upgrade should feel like meaningful progress (not diminishing returns)
3. **Accessibility:** First 2–3 upgrades must be reachable within 15–30 minutes of play
4. **Late-Game:** High-cost upgrades (100+ money) should feel aspirational but achievable
5. **Replayability:** Different upgrade paths (e.g., pure odds vs. money focus) should be viable

---

## Future Expansion (Post-MVP)

- Synergy bonuses: "If you own both boosts, activate combo for +3%"
- Upgrade chains: "Unlock advanced upgrades only after buying tier 1"
- Cosmetics: Purchased with in-game currency but no mechanical benefit
- Limited-time offers: Special discount upgrades
