# Coin Toss Game - Plan Summary (Visual)

## The Concept

```
Player tosses a coin
    │
    ├─ Heads (10%) ──→ Earn money, +1 to streak
    │                    │
    │                    └─ Reach 10 consecutive? ──→ WIN 🎉
    │
    └─ Tails (90%) ───→ Earn nothing, streak resets to 0
```

**Money Usage:**
- Buy upgrades (e.g., +1% head chance, 2x money multiplier)
- Upgrades stack and persist
- Unlock better odds → reach 10 heads faster

---

## 4-Slice Roadmap

```
┌─────────────────────────────────────────────────────────────┐
│ M001: Coin Toss Game - MVP                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ S01 (Medium Risk) ─────┐                                    │
│ Core Game Loop         │                                    │
│ • Coin toss (10% H)    │                                    │
│ • Streak tracking      │                                    │
│ • Money system         │                                    │
│ • Tests: >90% cov      │                                    │
│                        │                                    │
│                        ├──→ S02 (Medium Risk) ────┐         │
│                        │    Shop & Upgrades       │         │
│                        │    • 5+ upgrades        │         │
│                        │    • Cost scaling        │         │
│                        │    • Upgrade effects     │         │
│                        │    • Stacking logic      │         │
│                        │                          │         │
│                        └──→ S03 (Low Risk) ──┐    │         │
│                             React UI         │    │         │
│                             • Game display   │    │         │
│                             • Shop interface │    │         │
│                             • History log    │    │         │
│                             • Win modal      │    │         │
│                             (Integrated from S01+S02)      │
│                                                   │         │
│                                    ┌──────────────┘         │
│                                    │                        │
│                                    ├──→ S04 (Low Risk)      │
│                                    │    Polish & Docs       │
│                                    │    • Full test suite    │
│                                    │    • Edge cases         │
│                                    │    • README docs        │
│                                    │    • Performance pass   │
│                                    │                        │
│                                    └──→ RELEASE ✓           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 6 Core Requirements

| # | Requirement | Owner | Status |
|---|---|---|---|
| R001 | Coin toss: 10% heads, 90% tails | S01 | Active |
| R002 | Streak tracking; win at 10 heads | S01 | Active |
| R003 | Money earned on heads; spendable | S01/S02 | Active |
| R004 | 5+ shop upgrades with effects | S02 | Active |
| R005 | Full event history (JSON log) | S03 | Active |
| R006 | Clear UI displaying all state | S03 | Active |

---

## Success Criteria (M001 Done)

- ✓ Odds validated (1000+ tosses, ~10% heads)
- ✓ Streak resets on tails; wins at 10 heads
- ✓ Money flows: heads earn, shop deducts
- ✓ 5+ upgrades available and stackable
- ✓ Game state persists through session
- ✓ History exports as JSON
- ✓ UI is responsive, accessible, clear
- ✓ Win state detected and displayed
- ✓ >85% code coverage
- ✓ README documented

---

## Key Risks & Mitigation

### Risk 1: Early Game Tedium (10% head rate)
**Problem:** Players might quit before experiencing progression if heads are too rare.  
**Mitigation:** Validate in S02 UAT; adjust first upgrade cost if needed.

### Risk 2: Shop Balancing
**Problem:** Upgrades could be trivializing or inaccessible.  
**Mitigation:** Playtest during S02; scale costs based on actual head frequency.

### Risk 3: UI Clarity
**Problem:** Player doesn't understand what's happening or why.  
**Mitigation:** Focus on clear display in S03; include full history for transparency.

---

## Assumptions

- **Tech:** React (Vite/CRA), Jest, Context API
- **State:** In-memory; no persistence across sessions (post-MVP)
- **Browsers:** Modern (Chrome, Firefox, Safari)
- **Deploy:** Static hosting (GitHub Pages, Vercel, etc.)

---

## Files Created

```
.gsd/
  PROJECT.md ...................... Living project status
  REQUIREMENTS.md ................. Requirement contract (6 active)
  milestones/
    M001/
      M001-ROADMAP.md ............ Full roadmap with slice details
      M001-SUMMARY.md ............ Plan summary & decisions
```

---

## Next Step

When ready to start: **Execute S01** (Core Game Loop)

```
Tasks in S01:
- [ ] T01: Implement coin toss function with odds validation
- [ ] T02: Implement streak tracking logic
- [ ] T03: Implement money system (earn on heads)
- [ ] T04: Implement win detection (10 consecutive heads)
- [ ] T05: Write comprehensive unit tests (>90% coverage)
- [ ] T06: Integrate all systems; verify end-to-end
```
