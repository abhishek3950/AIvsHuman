# AivsHuman

A decentralized platform where AI and humans compete in prediction markets. The first implementation features a 5-minute BTC price prediction market on Base Sepolia, where users can bet against AI predictions using custom tokens.

## Features
- AI-powered price predictions
- Real-time market data from CoinGecko
- Token-based betting system with faucet
- USDC token purchase option
- Automated market creation and settlement
- Mobile-friendly interface with dark/light mode

## Tech Stack
- Smart Contracts: Solidity, Hardhat
- Frontend: Next.js, TypeScript, Tailwind CSS, RainbowKit
- AI Agent: Python, scikit-learn
- Network: Base Sepolia
- APIs: CoinGecko

## Architecture
The project is divided into three main components:

### 1. Smart Contracts
- `OverOrUnderToken.sol`: ERC20 token with faucet and USDC purchase functionality
- `BettingContract.sol`: Core betting logic and market management
- Deployed on Base Sepolia testnet

### 2. Frontend
- Next.js application with TypeScript
- RainbowKit for wallet integration
- Real-time price updates
- Dark/Light mode support
- Mobile-responsive design

### 3. AI Agent
- Python-based price prediction model
- Uses Random Forest algorithm
- Fetches historical data from CoinGecko
- Automatically creates and settles markets

## Prerequisites
- Node.js v18 or later
- npm or yarn
- Python 3.8 or later
- A Base Sepolia wallet with testnet ETH
- A WalletConnect Project ID (for frontend)

## Project Structure
```
AivsHuman/
├── contracts/           # Smart contracts
│   ├── contracts/      # Solidity contracts
│   ├── scripts/        # Deployment scripts
│   └── test/          # Contract tests
├── frontend/           # Next.js frontend
│   ├── app/           # Next.js app router
│   ├── components/    # React components
│   └── config/        # Configuration files
└── ai-agent/          # Python AI prediction agent
    ├── price_predictor.py
    └── requirements.txt
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

## Contributing
This is a private project. Please contact the author for collaboration opportunities.

## Contact
- Twitter: [@askabhibansal](https://x.com/askabhibansal)
- GitHub: [abhishek3950](https://github.com/abhishek3950)

## License
All rights reserved. This codebase is private and not available for public use. 