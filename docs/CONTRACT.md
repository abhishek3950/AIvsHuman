# Smart Contract Documentation

## Overview
The OverOrUnder betting system consists of three main contracts:
1. `BettingContract.sol` - Main betting logic
2. `OverOrUnderToken.sol` - ERC20 token for betting
3. `Faucet.sol` - Token distribution for testing
4. `AIAgent.sol` - AI prediction and market settlement

## BettingContract.sol

### Constants
- `MARKET_DURATION`: 5 minutes - Total duration of a market
- `BETTING_WINDOW`: 4 minutes - Time window for placing bets
- `MIN_BET`: 10 tokens - Minimum bet amount
- `MAX_BET`: 100 tokens - Maximum bet per user
- `MAX_TOTAL_BET`: 10000 tokens - Maximum total bets per market
- `PLATFORM_FEE`: 10% - Platform fee for each market
- `INITIAL_LIQUIDITY`: 100 tokens - Initial liquidity for each market

### Functions

#### Constructor
```solidity
constructor(address _token, address _aiAgent, address _treasury)
```
- Initializes the contract with token, AI agent, and treasury addresses
- Transfers ownership to the deployer

#### Market Management
```solidity
function createMarket(uint256 aiPrediction) external
```
- Creates a new betting market
- Only callable by the AI agent
- Requires previous market to be settled
- Sets up initial liquidity
- Emits `MarketCreated` event

```solidity
function settleMarket(uint256 marketId, uint256 actualPrice) external
```
- Settles a market with the actual BTC price
- Only callable by the AI agent
- Requires market to be ended
- Emits `MarketSettled` event

#### Betting Functions
```solidity
function placeBet(uint256 marketId, bool isOver, uint256 amount) external nonReentrant
```
- Places a bet on a market
- Requires market to be active and within betting window
- Validates bet amount against limits
- Transfers tokens from user to contract
- Emits `BetPlaced` event

```solidity
function claimWinnings(uint256 marketId) external nonReentrant
```
- Claims winnings from a settled market
- Requires market to be settled
- Validates user hasn't claimed before
- Calculates and transfers winnings
- Emits `WinningsClaimed` event

#### View Functions
```solidity
function getCurrentMarket() external view returns (uint256, uint256, uint256, uint256, uint256, uint256, bool)
```
- Returns details of the current active market
- Returns zeros if no active market

```solidity
function getUserBets(uint256 marketId, address user) external view returns (uint256, uint256, bool)
```
- Returns user's bets for a specific market
- Returns over bet amount, under bet amount, and claim status

```solidity
function getMarket(uint256 marketId) external view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256, bool)
```
- Returns complete market details
- Includes all market parameters and current state

#### Admin Functions
```solidity
function updateAiAgent(address _newAiAgent) external onlyOwner
```
- Updates the AI agent address
- Only callable by contract owner
- Emits `AiAgentUpdated` event

```solidity
function updateTreasury(address _newTreasury) external onlyOwner
```
- Updates the treasury address
- Only callable by contract owner
- Emits `TreasuryUpdated` event

### Events
- `MarketCreated(uint256 indexed marketId, uint256 startTime, uint256 aiPrediction)`
- `BetPlaced(uint256 indexed marketId, address indexed user, bool isOver, uint256 amount)`
- `MarketSettled(uint256 indexed marketId, uint256 actualPrice)`
- `WinningsClaimed(uint256 indexed marketId, address indexed user, uint256 amount)`
- `AiAgentUpdated(address indexed newAiAgent)`
- `TreasuryUpdated(address indexed newTreasury)`

## OverOrUnderToken.sol
Standard ERC20 token implementation with:
- 18 decimals
- Initial supply of 1,000,000 tokens
- Standard transfer and approval functions
- No special restrictions on transfers

## Faucet.sol
Testing utility that:
- Allows users to request test tokens
- Has a cooldown period between requests
- Distributes a fixed amount per request
- Only works on test networks

## AIAgent.sol
Handles AI predictions and market settlement:
- Creates new markets with AI predictions
- Settles markets with actual BTC prices
- Interfaces with external price feeds
- Protected by access control

## Security Considerations
1. Reentrancy protection on critical functions
2. Access control for admin functions
3. Input validation for all parameters
4. Safe math operations
5. Event emission for tracking
6. Proper cleanup of state

## Error Handling
Common error messages:
- "Invalid market" - Market ID out of range
- "Market already settled" - Attempting to bet on settled market
- "Betting window closed" - Betting period ended
- "Bet too small/large" - Bet amount outside limits
- "Market bet limit reached" - Total bets exceeded
- "Already claimed" - Attempting to claim twice
- "Market not settled" - Attempting to claim before settlement

## Testing
The contracts include comprehensive tests for:
- Market creation and settlement
- Betting functionality
- Winnings calculation
- Error cases
- Access control
- Edge cases 