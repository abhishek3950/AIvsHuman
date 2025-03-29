# Over or Under - BTC Price Prediction

A decentralized application for predicting BTC price movements on Base Sepolia. Users can bet on whether the BTC price will be above or below the AI agent's prediction after 5 minutes.

## Features

- Real-time BTC price updates from CoinGecko
- AI-powered price predictions
- 5-minute betting windows
- Token-based betting system
- Faucet for free tokens
- USDC token purchase option
- Dark/Light mode support
- Mobile-friendly interface

## Prerequisites

- Node.js v18 or later
- npm or yarn
- A Base Sepolia wallet with testnet ETH
- A WalletConnect Project ID (for frontend)

## Project Structure

```
overORunder/
├── contracts/           # Smart contracts
├── frontend/           # Next.js frontend
└── ai-agent/          # Python AI prediction agent
```

## Setup

### 1. Smart Contracts

```bash
cd contracts
npm install
cp .env.example .env
# Edit .env with your configuration
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your configuration
```

### 3. AI Agent

```bash
cd ai-agent
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
```

## Deployment

### 1. Deploy Smart Contracts

```bash
cd contracts
npx hardhat run scripts/deploy.ts --network baseSepolia
```

### 2. Deploy Frontend

```bash
cd frontend
npm run build
npm run start
```

### 3. Start AI Agent

```bash
cd ai-agent
source venv/bin/activate  # On Windows: venv\Scripts\activate
python price_predictor.py
```

## Contract Addresses

After deployment, update the following addresses in your frontend `.env.local`:

- `NEXT_PUBLIC_BETTING_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS`

## Usage

1. Connect your wallet to Base Sepolia
2. Get free tokens from the faucet or purchase with USDC
3. View current market and AI prediction
4. Place your bet (Over/Under)
5. Wait for the market to settle
6. Claim your winnings if you won

## Development

### Smart Contracts

```bash
cd contracts
npx hardhat compile
npx hardhat test
```

### Frontend

```bash
cd frontend
npm run dev
```

### AI Agent

```bash
cd ai-agent
python price_predictor.py
```

## License

MIT 