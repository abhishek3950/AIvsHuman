# API Documentation

## Smart Contracts

### OverOrUnderToken Contract

#### Functions

##### `buyTokens(uint256 amount)`
- **Description**: Purchase tokens using USDC
- **Parameters**:
  - `amount`: Number of tokens to purchase
- **Events**:
  - `TokensPurchased(address indexed buyer, uint256 amount, uint256 usdcAmount)`

##### `claimFaucet()`
- **Description**: Claim free tokens from faucet (10 tokens every 24 hours)
- **Events**:
  - `FaucetClaimed(address indexed user, uint256 amount)`

##### `balanceOf(address account)`
- **Description**: Get token balance of an account
- **Parameters**:
  - `account`: Address to check balance for
- **Returns**: Token balance

### BettingContract Contract

#### Functions

##### `getCurrentMarket()`
- **Description**: Get details of the current active market
- **Returns**:
  - `id`: Market ID
  - `startTime`: Market start timestamp
  - `endTime`: Market end timestamp
  - `aiPrediction`: AI's price prediction
  - `totalOverBets`: Total amount bet on Over
  - `totalUnderBets`: Total amount bet on Under
  - `settled`: Whether market is settled

##### `placeBet(uint256 marketId, bool isOver, uint256 amount)`
- **Description**: Place a bet on a market
- **Parameters**:
  - `marketId`: ID of the market to bet on
  - `isOver`: True for Over bet, False for Under bet
  - `amount`: Amount of tokens to bet
- **Events**:
  - `BetPlaced(uint256 indexed marketId, address indexed user, bool isOver, uint256 amount)`

##### `claimWinnings(uint256 marketId)`
- **Description**: Claim winnings from a settled market
- **Parameters**:
  - `marketId`: ID of the market to claim from
- **Events**:
  - `WinningsClaimed(uint256 indexed marketId, address indexed user, uint256 amount)`

##### `getUserBets(uint256 marketId, address user)`
- **Description**: Get user's bets for a specific market
- **Parameters**:
  - `marketId`: ID of the market
  - `user`: Address of the user
- **Returns**:
  - `overBet`: Amount bet on Over
  - `underBet`: Amount bet on Under
  - `hasClaimed`: Whether winnings have been claimed

## Frontend API

### CoinGecko Integration
- **Endpoint**: `https://api.coingecko.com/api/v3`
- **Rate Limit**: 50 calls/minute
- **Endpoints Used**:
  - `/simple/price?ids=bitcoin&vs_currencies=usd`: Get current BTC price
  - `/coins/bitcoin/market_chart/range`: Get historical price data

### Web3 Integration
- **Network**: Base Sepolia
- **Chain ID**: 84532
- **RPC URL**: `https://sepolia.base.org`
- **Block Explorer**: `https://sepolia.basescan.org`

## AI Agent API

### Price Prediction Model
- **Input Features**:
  - 5 lagged price values
  - 5-day Simple Moving Average
  - 20-day Simple Moving Average
  - 14-day Relative Strength Index
- **Output**: Predicted price after 5 minutes
- **Update Frequency**: Every 5 minutes

### Market Management
- **Market Creation**: Every 5 minutes
- **Market Settlement**: After 5 minutes
- **Data Collection**: Historical data from last 30 days 