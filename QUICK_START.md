# Coin Toss Game - Quick Start Guide

## Project Files

- **PLAN.md** ← Start here; visual roadmap and overview
- **SHOP_UPGRADES.md** ← Detailed upgrade examples and balancing
- **.gsd/PROJECT.md** ← Living project status
- **.gsd/REQUIREMENTS.md** ← 6 core requirements
- **.gsd/milestones/M001/M001-ROADMAP.md** ← Full milestone roadmap (4 slices)

## 30-Second Project Summary

**What:** Browser game where players toss coins (10% heads, 90% tails) to earn money and buy upgrades, aiming for 10 consecutive heads to win.

**Why:** Incremental game with progression, strategy (which upgrades to buy), and clear win condition.

**How Long:** 4 slices, estimated ~1–2 weeks depending on scope creep.

## Execution Roadmap

```
S01: Core Game Logic (Days 1–2)
  └─→ Coin toss, streak, money, tests
  
S02: Shop System (Days 3–4)
  └─→ 5+ upgrades, effects, costs
  
S03: React UI (Days 5–6)
  └─→ Game display, shop, history, win state
  
S04: Polish & Docs (Days 7–8)
  └─→ Tests, edge cases, README
```

## File Structure

```
CoinTossGame/
  PLAN.md ........................ Visual overview (READ FIRST)
  SHOP_UPGRADES.md .............. Upgrade reference
  QUICK_START.md ................ This file
  .gsd/
    PROJECT.md .................. Living status
    REQUIREMENTS.md ............. 6 active reqs
    milestones/
      M001/
        M001-ROADMAP.md ........ Full roadmap
        M001-SUMMARY.md ........ Plan summary
  src/
    (To be created during S01)
    gameEngine.js ............... Coin toss, streak, money logic
    shopSystem.js ............... Upgrades and purchases
    components/
      GameBoard.jsx ............ Main UI component
      ShopPanel.jsx ............ Shop interface
      HistoryLog.jsx ........... Event history display
  tests/
    (To be created)
    gameEngine.test.js
    shopSystem.test.js
    components.test.js
  README.md ..................... Auto-generated docs
```

## Key Decisions Already Made

- **Tech Stack:** React (hooks), Jest, no external game engine
- **Odds:** Hard-coded at 10% heads, 90% tails (unless upgraded)
- **Win Condition:** Exactly 10 consecutive heads
- **Money Model:** Earned only on heads; no passive income
- **Upgrades:** 5+ minimum; effects must be mechanical (not cosmetic)
- **Persistence:** In-memory for MVP (no localStorage yet)
- **Accessibility:** ARIA labels, semantic HTML, keyboard nav

## Success Metrics (End of M001)

- [ ] Game works end-to-end (start to 10 consecutive heads)
- [ ] Odds validated (1000+ tosses ≈ 10% heads)
- [ ] 5+ upgrades purchasable and functional
- [ ] Full event history logged
- [ ] UI is responsive and accessible
- [ ] >85% code coverage
- [ ] README explains mechanics and extension

## When You're Ready to Start

1. Move to S01 execution
2. Implement core game logic (test-first)
3. Validate odds over many tosses
4. Proceed to S02 (shop upgrades)

## Known Risks

- **Early-game tedium:** 10% head rate may feel slow → validate in S02 UAT
- **Shop balancing:** Upgrades could be too cheap/expensive → adjust costs based on data
- **UI clarity:** Player must understand what's happening → focus on clear display in S03

## Questions?

Refer to the detailed documents:
- **Game mechanics:** See PLAN.md and .gsd/REQUIREMENTS.md
- **Upgrade design:** See SHOP_UPGRADES.md
- **Slice details:** See .gsd/milestones/M001/M001-ROADMAP.md
