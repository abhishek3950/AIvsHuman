# Deployment Guide

## Prerequisites

1. Base Sepolia Testnet ETH
   - Get testnet ETH from the [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-sepolia-faucet)
   - Save your wallet private key securely

2. Environment Setup
   ```bash
   # Install dependencies
   cd contracts
   npm install

   # Create environment file
   cp .env.example .env
   ```

3. Required Environment Variables
   ```env
   # Network Configuration
   RPC_URL=https://sepolia.base.org
   PRIVATE_KEY=your_private_key_here

   # Contract Addresses
   USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7c
   TREASURY_ADDRESS=your_treasury_address_here
   USDC_WALLET_ADDRESS=your_usdc_wallet_address_here
   AI_AGENT_ADDRESS=your_ai_agent_address_here

   # Etherscan API Key (for contract verification)
   ETHERSCAN_API_KEY=your_etherscan_api_key_here
   ```

## Deployment Steps

1. Deploy Token Contract
   ```bash
   npx hardhat run scripts/deploy.ts --network baseSepolia
   ```
   - Save the deployed token contract address
   - Update frontend `.env.local` with the new address

2. Deploy Betting Contract
   ```bash
   npx hardhat run scripts/deploy.ts --network baseSepolia
   ```
   - Save the deployed betting contract address
   - Update frontend `.env.local` with the new address

3. Verify Contracts
   ```bash
   npx hardhat verify --network baseSepolia <TOKEN_CONTRACT_ADDRESS> <USDC_ADDRESS> <TREASURY_ADDRESS> <USDC_WALLET_ADDRESS>
   npx hardhat verify --network baseSepolia <BETTING_CONTRACT_ADDRESS> <TOKEN_CONTRACT_ADDRESS> <AI_AGENT_ADDRESS> <TREASURY_ADDRESS>
   ```

4. Initialize Contracts
   - Transfer initial tokens to betting contract
   - Set up AI agent address
   - Configure treasury and USDC wallet addresses

## Post-Deployment Checklist

1. Contract Verification
   - Verify contracts on Base Sepolia block explorer
   - Check contract code matches GitHub repository

2. Frontend Configuration
   - Update contract addresses in `.env.local`
   - Test wallet connection
   - Verify token interactions

3. AI Agent Setup
   - Configure AI agent with contract addresses
   - Test market creation and settlement
   - Monitor prediction accuracy

4. Security Checks
   - Verify access controls
   - Test emergency pause functionality
   - Review contract permissions

## Troubleshooting

### Common Issues

1. Insufficient Gas
   - Ensure wallet has enough Base Sepolia ETH
   - Check gas price settings in deployment script

2. Contract Verification Failures
   - Verify contract code matches exactly
   - Check constructor arguments
   - Ensure Etherscan API key is valid

3. Frontend Connection Issues
   - Verify contract addresses
   - Check network configuration
   - Test wallet connection

### Support
For deployment issues, contact:
- Twitter: [@askabhibansal](https://x.com/askabhibansal)
- GitHub: [abhishek3950](https://github.com/abhishek3950) 