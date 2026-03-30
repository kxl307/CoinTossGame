# Coin Toss Game - Architecture Overview

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     React UI Layer (S03)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌────────────────┐  ┌─────────────────┐    │
│  │  GameBoard   │  │  ShopPanel     │  │  HistoryLog     │    │
│  │              │  │                │  │                 │    │
│  │ • Display    │  │ • List upgrades│  │ • Show tosses   │    │
│  │   streak     │  │ • Buy buttons  │  │ • Show purchases│    │
│  │ • Show money │  │ • Descriptions│  │ • Export JSON   │    │
│  │ • Toss btn   │  │ • Costs        │  │                 │    │
│  └──────┬───────┘  └────────┬───────┘  └────────┬────────┘    │
│         │                   │                     │             │
│         └─────────────────────────────────────────┘             │
│                        ▼                                        │
│                  React Context                                 │
│              (or local state mgmt)                             │
│                        ▼                                        │
└─────────────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              Game State & Logic (S01 + S02)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │  gameEngine.js (S01) │  │  shopSystem.js (S02) │            │
│  │                      │  │                      │            │
│  │ • tossCoin()         │  │ • shopUpgrades[]     │            │
│  │ • updateStreak()     │  │ • purchaseUpgrade()  │            │
│  │ • awardMoney()       │  │ • getUpgrade()       │            │
│  │ • checkWin()         │  │ • applyUpgrade()     │            │
│  │ • getGameState()     │  │ • getShopState()     │            │
│  │ • emitEvent()        │  │                      │            │
│  └──────────┬───────────┘  └──────────┬───────────┘            │
│             │                         │                        │
│             └────────────┬────────────┘                        │
│                          ▼                                     │
│                   Game State Object                           │
│                   ┌──────────────────┐                        │
│                   │ streak: 5        │                        │
│                   │ money: 42        │                        │
│                   │ baseHeadOdds: 10 │                        │
│                   │ upgrades: [...]  │                        │
│                   │ history: [...]   │                        │
│                   │ isWon: false     │                        │
│                   └──────────────────┘                        │
│                                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Toss & Purchase

### Flow 1: Player Tosses Coin

```
User clicks "Toss" button
         │
         ▼
tossCoin(gameState) ────────────────┐
         │                          │
         ├─ Random(0,100)          │
         │  (determines H or T)     │
         │                          │
         ├─ Apply upgrades         │ gameEngine.js
         │  (modify odds)           │ (S01)
         │                          │
         ├─ updateStreak()         │
         │  (increment or reset)    │
         │                          │
         ├─ awardMoney()           │
         │  (if heads)              │
         │                          │
         └─ emitEvent()  ──────────┘
                │
                ▼
         Game State Updated
         history.push(event)
                │
                ▼
         React rerenders
         UI reflects new state

```

### Flow 2: Player Buys Upgrade

```
User clicks "Buy" on upgrade
         │
         ▼
purchaseUpgrade(gameState, upgradeId) ──┐
         │                               │
         ├─ validateFunds()             │
         │  (money >= cost?)             │
         │                               │
         ├─ deductMoney()               │ shopSystem.js
         │                              │ (S02)
         ├─ addToOwnedUpgrades()        │
         │                              │
         └─ applyUpgradeEffect()        │
            (modify baseHeadOdds,       │
             moneyMultiplier, etc)      │
                │                       │
                └──────────────────────┘
                │
                ▼
         Game State Updated
         upgrades array modified
         history.push(purchase event)
                │
                ▼
         React rerenders
         UI updates shop + history

```

---

## Component Tree (S03)

```
App
│
├─ GameLayout
│  ├─ GameBoard
│  │  ├─ StreakDisplay (shows X/10)
│  │  ├─ MoneyDisplay (shows total $)
│  │  └─ TossButton (triggers tossCoin)
│  │
│  ├─ ShopPanel
│  │  └─ UpgradeCard (map over upgrades[])
│  │     ├─ UpgradeName
│  │     ├─ UpgradeDescription
│  │     ├─ UpgradeCost
│  │     └─ BuyButton
│  │
│  └─ HistoryPanel
│     └─ EventItem (map over history[])
│        ├─ Timestamp
│        ├─ EventType (toss|purchase)
│        └─ EventDetails

(Props flow down; events bubble up via callbacks)
```

---

## Game State Schema

```typescript
interface GameState {
  // Core mechanics
  streak: number;                 // Current consecutive heads (0-10)
  money: number;                  // Total money earned
  isWon: boolean;                 // true when streak === 10
  
  // Odds (modified by upgrades)
  baseHeadOdds: number;          // 10 + (upgrades applied)
  
  // Owned upgrades
  upgrades: {
    [upgradeId: string]: {
      name: string;
      ownedCount: number;        // times purchased
      totalEffect: number;       // cumulative effect
    }
  }
  
  // Event log
  history: Array<{
    timestamp: string;           // ISO8601
    event: 'toss' | 'purchase';
    data: {
      // for toss: { result: 'H'|'T', streak, moneyEarned }
      // for purchase: { upgradeId, cost, newBalance }
    }
  }>
}
```

---

## Upgrade System (S02)

### Upgrade Effects (Applied to Game State)

```
Each upgrade:
  - Has a cost (money)
  - Has a description
  - Can be purchased multiple times
  - Has an effect function
  - Modifies game state when applied

Example: head_chance_boost_1
  cost: 10
  effect: (state) => {
    state.baseHeadOdds += 1;
    return state;
  }
  
Example: money_multiplier_2x
  cost: 50
  effect: (state) => {
    state.moneyMultiplier = 2;
    return state;
  }
```

### How Odds Work

```
tossCoin(gameState):
  
  effectiveOdds = baseHeadOdds +
                  (head_chance_boost upgrades) +
                  (other probability modifiers)
  
  random = Math.random() * 100
  
  if random < effectiveOdds:
    return 'HEADS'
  else:
    return 'TAILS'
```

---

## Testing Strategy

### S01: Unit Tests (gameEngine.js)
```
describe('tossCoin', () => {
  it('returns HEADS ~10% of 1000 tosses')
  it('returns TAILS ~90% of 1000 tosses')
})

describe('updateStreak', () => {
  it('increments on HEADS')
  it('resets to 0 on TAILS')
})

describe('checkWin', () => {
  it('detects streak === 10')
})

describe('awardMoney', () => {
  it('awards money on HEADS')
  it('awards 0 on TAILS')
})
```

### S02: Integration Tests (gameEngine + shopSystem)
```
describe('upgrade integration', () => {
  it('head_chance_boost increases odds')
  it('money_multiplier stacks correctly')
  it('upgrades persist through tosses')
})
```

### S03: Component Tests (React)
```
describe('GameBoard', () => {
  it('displays current streak')
  it('displays total money')
  it('toss button triggers tossCoin')
})

describe('ShopPanel', () => {
  it('lists all available upgrades')
  i
