````
# takeover.fun — Agent Skill (Base Mainnet)

**Chain:** Base Mainnet (8453)
**App:** `https://takeover.fun`
**Objective:** Earn ETH from coin trading fees via Harberger-taxed seat ownership.

---

## Contract Addresses

| Contract | Address |
|----------|---------|
| TakeoverFeeSplitManager | `0x22c738cA7b87933949dedf66DC0D51F3F52f1bd6` |
| TakeoverZap | `0x45edcCb44da8aA1BF4b9e4F2BAAe61760d1c8fB9` |
| TakeoverBuyback | `0xA5f5Df01A90E33F4D94530CEb5A3AD2F6e95335B` |
| USDC | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |

> See [Base Sepolia skill](/base-sepolia/skill.md) for testnet addresses.

---

## Data Model

- **USDC amounts**: 6 decimals (`1 USDC = 1_000_000`). All prices, deposits, balances are USDC 6dp.
- **ETH amounts**: 18 decimals (wei). Fee income is paid in ETH.
- **PoolId**: `bytes32` — derived from Uniswap V4 pool key.
- **Seat index**: `uint256` in range `0–99`. Each pool has exactly 100 seats.
- **SeatInfo struct**: `{ address holder, uint128 price, uint128 deposit, uint64 lastTaxTime, uint64 lastPriceChangeTime }`

---

## How It Works

Each coin on Flaunch that uses Takeover has a 100-seat grid. Each seat earns 1% of the coin's trading fees (paid in ETH). To hold a seat you must:

1. **Set a self-assessed price** (USDC) — anyone can buy you out at this price instantly.
2. **Deposit USDC** — pays your Harberger tax (default 5%/week of your price).

Tax drains your deposit continuously. When deposit hits zero, the seat is forfeited. Abandoning a seat returns your remaining deposit; forfeiture does not.

---

## REST API Reference

The app exposes read-only JSON endpoints. No authentication required. All responses are `application/json`. Base URL is `https://takeover.fun`.

### Pools

**`GET /api/pools`** — List pools with pagination.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `pageSize` | int | 20 | Items per page (max 100) |
| `sortBy` | string | `createdAt` | Sort field |
| `sortOrder` | string | `desc` | `asc` or `desc` |
| `graduated` | bool | — | Filter by graduation status |
| `search` | string | — | Search by name/symbol |
| `view` | string | — | `almost-graduated` or `newest` for special views |
| `includeSeatIndices` | bool | false | Include filled seat indices |

**`GET /api/pools/{poolId}`** — Single pool with seats and metrics.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `includeSeats` | bool | true | Include all 100 seats |
| `includeMetrics` | bool | true | Include computed metrics |

**`GET /api/pools/{poolId}/events`** — Event history for a pool (claims, buyouts, forfeitures, price changes). Paginated.

**`GET /api/pools/{poolId}/rewards`** — Recent ETH reward events (fee distributions from trading). `limit` param (max 50).

### Coins

**`GET /api/coin/{coinAddress}`** — Look up pool by memecoin ERC-20 address. Returns pool with all seats, metrics, and holder identities. Add `?fresh=1` to bypass cache.

### Seats

**`GET /api/seats/{poolId}/{seatIndex}`** — Single seat with computed metrics.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `includeMetrics` | bool | true | Include currentBalance, pendingFees, weeklyTax, etc. |
| `includeEvents` | bool | false | Include event history |

**`GET /api/seats/{poolId}/{seatIndex}/events`** — Seat event history. Paginated with `page` and `pageSize`.

### Portfolio & Users

**`GET /api/portfolio/{address}`** — User's full portfolio: all held seats with pool data and metrics, net winnings, alert seats (low balance).

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `summary` | bool | false | Return summary only (no individual seats) |

**`GET /api/users/{address}`** — User profile (display name, avatar, level).

### Stats & Leaderboards

**`GET /api/stats`** — Protocol-level statistics.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `view` | string | `protocol` | `protocol`, `dashboard`, `activity`, `revenue`, or `idle-tax` |

**`GET /api/stats/leaderboard`** — Leaderboard.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `type` | string | `net` | `net` (earnings), `seats`, `points`, or `merged` |
| `limit` | int | 100 | Max entries (max 500) |

### On-Chain Data (Cached RPC)

**`GET /api/rpc/pending-fees/{address}`** — Pending ETH fees for a user (wei string). Cached server-side.

**`GET /api/rpc/global-fees`** — Global fee totals: `managerFees`, `splitFees`, `taxRateBps`.

**`GET /api/rpc/eth-price`** — Current ETH/USD price.

### Activity & Live

**`GET /api/activity/global`** — Recent events across all pools with user identities. `limit` param (max 100).

**`GET /api/live`** — **Server-Sent Events (SSE)** for real-time updates.

| Param | Type | Description |
|-------|------|-------------|
| `poolId` | string | Filter to specific pool |
| `holder` | string | Filter to specific holder |

Events stream as `data: {...}\n\n`. Connection auto-closes after 5 minutes; reconnect to resume.

### Featured Coin

**`GET /api/featured-coin`** — Returns the currently featured coin address (or 404 if none). Used during launch phase.

---

## Contract Interface — Write Functions

All write functions target the **TakeoverFeeSplitManager** contract. USDC approval is required before any function that transfers USDC.

### Pre-requisite: USDC Approval

Before calling `addBatch` or `addDeposit`, approve the manager contract to spend your USDC:

```solidity
USDC.approve(managerAddress, amount)
```

### Acquire Seats (Claim + Buyout)

```solidity
function addBatch(
    bytes32 _poolId,
    SeatAcquireParams[] calldata _params
) external

struct SeatAcquireParams {
    uint256 seatId;     // 0–99
    uint256 price;      // Your self-assessed price (USDC 6dp)
    uint256 maxPrice;   // Slippage protection for buyouts (ignored for empty seats)
    uint256 amount;     // For empty seats: deposit amount. For buyouts: payment (must >= current price; excess becomes deposit)
}
```

This is the **single entry point** for both claiming empty seats and buying out occupied seats. The contract auto-detects based on seat state. It also auto-forfeits seats whose deposit has been exhausted, so you never need a separate `pokeTax` before buying.

### Manage Positions

```solidity
function setPrice(bytes32 _poolId, uint256 _seatId, uint256 _newPrice) external
// 20-minute cooldown between price changes. Also triggers tax application.
// Cannot set price to 0. Reverts with CooldownActive if too soon.

function addDeposit(bytes32 _poolId, uint256 _seatId, uint256 _amount) external
// Top up USDC deposit to extend runway. Requires USDC approval.

function withdrawDeposit(bytes32 _poolId, uint256 _seatId, uint256 _amount) external
// Withdraw excess deposit. Cannot withdraw more than current balance after tax.

function abandonSeat(bytes32 _poolId, uint256 _seatId) external
// Exit cleanly. Returns remaining deposit + claims pending ETH fees.
// Subject to 20-minute cooldown after price change.
```

### Claim ETH Fee Income

```solidity
function claimFees(bytes32[] calldata _poolIds) external returns (uint256 total)
// Claims ETH fees across specified pools. Use getHolderPools() to get your pool IDs.
// Also applies pending tax on every seat you hold in those pools.
```

### Creator Functions

```solidity
function claimCreatorFees(bytes32 _poolId) external returns (uint256 total)
// Pool creator claims ETH fees from empty (unheld) seats.

function creatorWithdrawCoin(bytes32 _poolId) external
// Creator who holds all 100 seats can withdraw the Flaunch NFT,
// unregistering the pool. Claims all fees and refunds all deposits.
```

### Permissionless Tax Poke

```solidity
function pokeTax(
    bytes32[] calldata _poolIds,
    uint256[][] calldata _seatIds
) external
// Force-collect accrued tax on arbitrary seats. Forfeits seats with exhausted deposits.
// Anyone can call; caller pays gas. Useful for keeper bots.
```

---

## Contract Interface — View Functions

### Seat State

```solidity
function seats(bytes32 _poolId, uint256 _seatId) external view
    returns (address holder, uint128 price, uint128 deposit, uint64 lastTaxTime, uint64 lastPriceChangeTime)

function currentBalance(bytes32 _poolId, uint256 _seatId) external view returns (int256)
// Deposit minus accrued tax. Negative means forfeiture is overdue.

function timeUntilForfeiture(bytes32 _poolId, uint256 _seatId) external view returns (uint256)
// Seconds until deposit runs out. 0 if already forfeit-able.

function cooldownRemaining(bytes32 _poolId, uint256 _seatId) external view returns (uint256)
// Seconds until price can be changed. 0 if ready.

function amountClaimed(bytes32 _poolId, uint256 _seatId) external view returns (uint256)
// Cumulative ETH already claimed from this seat.
```

### Fee Queries

```solidity
function pendingFees(bytes32 _poolId, uint256 _seatId) external view returns (uint256)
// Unclaimed ETH for a specific seat.

function pendingFees(bytes32 _poolId, address _holder) external view returns (uint256)
// Unclaimed ETH for all seats a holder owns in a pool.

function pendingFees(address _holder) external view returns (uint256)
// Unclaimed ETH across all pools for a holder.
```

### Holder Queries

```solidity
function getHolderPools(address _holder) external view returns (bytes32[])
// All pool IDs where holder has seats. Use this to build claimFees() call.

function getHolderSeats(bytes32 _poolId, address _holder) external view returns (uint256[])
// All seat indices held in a specific pool.

function holderSeatCount(address _holder, bytes32 _poolId) external view returns (uint256)
```

### Pool State

```solidity
function poolRegistered(bytes32 _poolId) external view returns (bool)
function poolCreator(bytes32 _poolId) external view returns (address)
function poolFlaunch(bytes32 _poolId) external view returns (address)
function poolTokenId(bytes32 _poolId) external view returns (uint256)
```

### Protocol Constants

```solidity
function TOTAL_SEATS() external view returns (uint256)      // 100
function SEAT_SHARE() external view returns (uint256)        // 1% in 5dp precision
function PRICE_COOLDOWN() external view returns (uint256)    // 1200 (20 minutes)
function DEFAULT_TAX_RATE_BPS() external view returns (uint256)  // 500 (5%/week)
function MIN_TAX_RATE() external view returns (uint256)      // 10 (0.1%/week)
function MAX_TAX_RATE() external view returns (uint256)      // 1000 (10%/week)
function ONE_WEEK() external view returns (uint256)          // 604800
function taxRateBps() external view returns (uint256)        // Current tax rate
function protocolFeeBps() external view returns (uint256)    // Current buyout fee rate (default 2000)
```

---

## Events

```solidity
event PoolRegistered(bytes32 indexed poolId, address indexed creator, address flaunch)
event SeatClaimed(bytes32 indexed poolId, uint256 indexed seatId, address indexed holder, uint256 price, uint256 deposit)
event SeatBought(bytes32 indexed poolId, uint256 indexed seatId, address oldHolder, address indexed newHolder, uint256 price)
event SeatAbandoned(bytes32 indexed poolId, uint256 indexed seatId, address indexed holder, uint256 refund)
event SeatForfeited(bytes32 indexed poolId, uint256 indexed seatId, address indexed holder)
event PriceUpdated(bytes32 indexed poolId, uint256 indexed seatId, uint256 oldPrice, uint256 newPrice)
event DepositAdded(bytes32 indexed poolId, uint256 indexed seatId, uint256 amount)
event DepositWithdrawn(bytes32 indexed poolId, uint256 indexed seatId, uint256 amount)
event FeesClaimed(address indexed holder, uint256 amount)
event TaxPoked(bytes32 indexed poolId, uint256 indexed seatId, uint256 taxCollected, bool forfeited)
event CreatorFeesDistributed(bytes32 indexed poolId, address indexed creator, uint256 amount)
event CreatorWithdrewCoin(bytes32 indexed poolId, address indexed creator, uint256 depositRefund, uint256 ethFees)
```

---

## Key Constants & Formulas

| Parameter | Value |
|-----------|-------|
| Seats per pool | 100 |
| Fee share per seat | 1% of pool's trading fees |
| Default tax rate | 500 bps = 5% of price per week |
| Price change cooldown | 20 minutes |
| Buyout fee | `protocolFeeBps` (default 2000 bps = 20%) of sale price |
| Buyout fee split | 30% to protocol, 70% to pool creator |
| Seller receives on buyout | 80% of price + remaining deposit (after tax) |
| USDC decimals | 6 |
| ETH decimals | 18 |

### Tax Formula

```
taxOwed = price × taxRateBps × elapsedSeconds / (604800 × 10000)
weeklyTax = price × taxRateBps / 10000
```

### Runway

```
runwaySeconds = deposit × 604800 / weeklyTax
runwayWeeks = deposit / weeklyTax
```

### Equilibrium Price

The price at which weekly fee income equals weekly tax cost:

```
equilibriumPrice = weeklyFeesUsd × 10000 / taxRateBps
```

At 5% weekly tax: $10/week fees → $200 equilibrium price.

### Buyout Economics

When your seat is bought out:

```
buyoutFee      = currentPrice × protocolFeeBps / 10000   (default 20%)
protocolCut    = buyoutFee × 3000 / 10000                (30% of fee → 6% of price)
creatorCut     = buyoutFee - protocolCut                  (70% of fee → 14% of price)
sellerReceives = currentPrice - buyoutFee + remainingDeposit   (80% of price + deposit)
```

---

## Custom Errors

| Error | Meaning |
|-------|---------|
| `SeatAlreadyClaimed` | Seat is occupied (use buyout path) |
| `SeatNotClaimed` | Seat was forfeited during tax application |
| `SeatDoesNotExist` | Seat index >= 100 |
| `NotSeatHolder` | Caller doesn't own this seat |
| `CannotBuyOwnSeat` | Can't buy a seat you already hold |
| `PriceMustBePositive` | Price must be > 0 |
| `InsufficientDeposit` | Deposit too low |
| `InsufficientBalance` | Withdrawal exceeds available balance |
| `InsufficientPayment` | Buyout payment < current seat price |
| `CooldownActive` | Price change or abandon within 20-min cooldown |
| `PriceExceedsMax` | Current price exceeds your maxPrice (slippage) |
| `PoolNotRegistered` | Pool ID not registered in the contract |
| `NotAllSeatsHeld` | Creator must hold all 100 seats to withdraw coin |

---

## Agent Workflow

```
1. DISCOVER  — GET /api/pools to find active pools with volume
2. EVALUATE  — GET /api/pools/{poolId} to see all 100 seats, prices, balances
3. CALCULATE — equilibrium price from fee data; identify underpriced or empty seats
4. APPROVE   — USDC.approve(manager, totalAmount)
5. ACQUIRE   — addBatch(poolId, [{seatId, price, maxPrice, amount}, ...])
6. MONITOR   — GET /api/portfolio/{myAddress} for alerts; or poll seat endpoints
7. HARVEST   — claimFees(getHolderPools(myAddress)) when gas-efficient
8. ADJUST    — setPrice / addDeposit / withdrawDeposit as conditions change
9. EXIT      — abandonSeat when thesis invalidates (always abandon, never forfeit)
```

**Key rules:**
- Always abandon seats before deposit runs out. Forfeiture loses your deposit.
- Price is a conviction signal: too low and you get bought out, too high and taxes eat you.
- Use `GET /api/live?poolId=...` SSE for real-time event monitoring.
- Use `pokeTax` to force-forfeit seats with exhausted deposits before claiming them.

---

*Network: Base Mainnet (8453) | Last updated: February 2026*
````