# Coin Toss Game - Planning Complete

Welcome to the Coin Toss Game project. This is a comprehensive plan for building an incremental browser game with core mechanics, shop system, UI, and full testing.

## 📖 Where to Start

**New to the project?** Read these in order:

1. **PLAN.md** (5 min read) — Visual roadmap, 30-sec summary, key metrics
2. **QUICK_START.md** (3 min read) — Quick reference and file structure
3. **.gsd/REQUIREMENTS.md** (5 min read) — 6 core requirements

---

## 📁 Planning Artifacts

All planning documents are in this repository and in `.gsd/`:

### Quick Reference (Project Root)
| File | Purpose | Read Time |
|---|---|---|
| **PLAN.md** | Visual roadmap, overview, 30-sec summary | 5 min |
| **QUICK_START.md** | Quick reference, file structure, key decisions | 3 min |
| **SHOP_UPGRADES.md** | Detailed upgrade examples and balancing | 8 min |
| **ARCHITECTURE.md** | System diagrams, data flow, component tree | 10 min |
| **CHECKLIST.md** | Planning checklist, quality gates, timeline | 5 min |

### GSD Project Artifacts (.gsd/)
| File | Purpose | Detail Level |
|---|---|---|
| **PROJECT.md** | Living project status | Executive |
| **REQUIREMENTS.md** | 6 core requirements with validation | Detailed |
| **milestones/M001/M001-ROADMAP.md** | Full milestone roadmap with all slice details | Comprehensive |
| **milestones/M001/M001-SUMMARY.md** | Plan summary, key decisions, timeline | Executive |

---

## 🎮 Project Summary

**Game Concept:**
- Players toss coins with biased odds (10% heads, 90% tails)
- Earn money from heads, spend on upgrades
- Win by achieving 10 consecutive heads
- Full event history tracking

**Why This Game?**
- Teaches game loop design (toss → earn → upgrade → progress)
- Clear progression mechanics
- Balancing challenge (upgrades, costs, odds)
- Accessible incremental game style

---

## 🗓️ 4-Slice Roadmap

```
S01: Core Game Logic (Days 1–2)
  └─ Coin toss, streak tracking, money system
  └─ Full unit tests (>90% coverage)

S02: Shop System (Days 3–4)
  └─ 5+ purchasable upgrades with effects
  └─ Cost balancing and stacking logic

S03: React UI (Days 5–6)
  └─ Game board, shop panel, history log
  └─ Responsive, accessible interface

S04: Polish & Docs (Days 7–8)
  └─ Full test suite (>85% coverage)
  └─ Edge-case handling, README
```

**Total Estimated Time:** 5–9 days of focused development

---

## ✅ 6 Core Requirements

| # | Requirement | Owner | Status |
|---|---|---|---|
| R001 | Coin toss: 10% heads, 90% tails | S01 | ✓ Active |
| R002 | Streak tracking; win at 10 heads | S01 | ✓ Active |
| R003 | Money earned on heads; spendable | S01/S02 | ✓ Active |
| R004 | 5+ shop upgrades with effects | S02 | ✓ Active |
| R005 | Full event history (JSON log) | S03 | ✓ Active |
| R006 | Clear UI displaying all state | S03 | ✓ Active |

---

## 🎯 Success Metrics (End of M001)

- ✓ Game works end-to-end (start to 10 consecutive heads)
- ✓ Odds validated (1000+ tosses ≈ 10% heads)
- ✓ 5+ upgrades purchasable and functional
- ✓ Full event history logged and exportable
- ✓ UI responsive and accessible (ARIA labels, semantic HTML)
- ✓ >85% code coverage
- ✓ README documents mechanics and extension

---

## ⚠️ Key Risks & Mitigation

| Risk | Mitigation |
|---|---|
| **Early-game tedium** (10% head rate feels slow) | Validate in S02 UAT; adjust upgrade costs if needed |
| **Shop balancing** (upgrades too cheap/expensive) | Playtest during S02; scale costs based on data |
| **UI clarity** (player doesn't understand state) | Focus on clear display in S03; full history visible |

---

## 🛠️ Tech Stack (Decided)

- **Frontend:** React (hooks), Vite or Create React App
- **Testing:** Jest, React Testing Library
- **State:** React Context or local state (in-memory for MVP)
- **History:** JSON event log
- **Deployment:** Static hosting (GitHub Pages, Vercel)

---

## 📝 Key Decisions Already Made

- **Coin odds:** Hard-coded 10% heads, 90% tails (unless upgraded)
- **Win condition:** Exactly 10 consecutive heads
- **Money model:** Earned only on heads; no passive income
- **Upgrades:** 5+ minimum; effects must be mechanical (not cosmetic)
- **Persistence:** In-memory for MVP (no localStorage yet)
- **Accessibility:** ARIA labels, semantic HTML, keyboard navigation required

---

## 🚀 Ready to Execute?

When you're ready to start building:

1. **Read QUICK_START.md** for file structure
2. **Set up React project** (Vite or CRA)
3. **Begin S01 execution** (implement core game logic)
4. Follow the slice roadmap → S02 → S03 → S04

---

## 📚 Full Document Index

**For Game Design:**
- See PLAN.md (overview) and SHOP_UPGRADES.md (upgrade details)

**For Architecture:**
- See ARCHITECTURE.md (system diagrams, data flow, component tree)

**For Requirements & Scope:**
- See .gsd/REQUIREMENTS.md (6 core reqs with validation)

**For Execution Planning:**
- See .gsd/milestones/M001/M001-ROADMAP.md (detailed slice breakdown)

**For Quality & Timeline:**
- See CHECKLIST.md (quality gates, definition of done)

---

## Questions?

All planning questions should be answerable by referring to:
- **Game mechanics:** PLAN.md + REQUIREMENTS.md
- **Upgrade design:** SHOP_UPGRADES.md
- **Architecture:** ARCHITECTURE.md
- **Slice details:** M001-ROADMAP.md in .gsd/

**Status:** ✅ Planning complete. Ready to execute.
