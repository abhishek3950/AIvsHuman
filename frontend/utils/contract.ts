import { ethers } from 'ethers';
import { BETTING_CONTRACT_ABI } from '@/contracts/abi';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_BETTING_CONTRACT_ADDRESS as string;

// Types
export interface MarketData {
  id: bigint;
  startTime: bigint;
  endTime: bigint;
  aiPrediction: bigint;
  totalOverBets: bigint;
  totalUnderBets: bigint;
  settled: boolean;
}

export interface UserBets {
  overBet: bigint;
  underBet: bigint;
  hasClaimed: boolean;
}

// Initialize provider and contract
export const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    // Create a provider with Base Sepolia network configuration
    const provider = new ethers.BrowserProvider(window.ethereum, {
      chainId: 84532, // Base Sepolia chain ID
      name: 'base-sepolia',
      ensAddress: undefined,
      ensNetwork: undefined
    });
    return provider;
  }
  throw new Error('No ethereum provider found');
};

export const getContract = async (withSigner = false) => {
  try {
    const provider = getProvider();
    console.log('Creating contract with address:', CONTRACT_ADDRESS);
    
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      BETTING_CONTRACT_ABI,
      provider
    ) as unknown as ethers.Contract & {
      getCurrentMarket(): Promise<MarketData>;
      getUserBets(marketId: bigint, userAddress: string): Promise<UserBets>;
      placeBet(marketId: bigint, isOver: boolean, amount: bigint): Promise<ethers.ContractTransactionResponse>;
      claimWinnings(marketId: bigint): Promise<ethers.ContractTransactionResponse>;
    };

    if (withSigner) {
      const signer = await provider.getSigner();
      return contract.connect(signer) as typeof contract;
    }

    return contract;
  } catch (error) {
    console.error('Error creating contract:', error);
    throw error;
  }
};

// Contract read functions
export const getCurrentMarket = async () => {
  try {
    console.log('Getting current market...');
    const contract = await getContract();
    const market = await contract.getCurrentMarket();
    console.log('Current market data:', market);
    return market;
  } catch (error) {
    console.error('Error getting current market:', error);
    throw error;
  }
};

export const getUserBets = async (marketId: bigint, userAddress: string) => {
  try {
    const contract = await getContract();
    return contract.getUserBets(marketId, userAddress);
  } catch (error) {
    console.error('Error getting user bets:', error);
    throw error;
  }
};

// Contract write functions
export const placeBet = async (marketId: bigint, isOver: boolean, amount: bigint) => {
  try {
    const contract = await getContract(true);
    const tx = await contract.placeBet(marketId, isOver, amount);
    return tx.wait();
  } catch (error) {
    console.error('Error placing bet:', error);
    throw error;
  }
};

export const claimWinnings = async (marketId: bigint) => {
  try {
    const contract = await getContract(true);
    const tx = await contract.claimWinnings(marketId);
    return tx.wait();
  } catch (error) {
    console.error('Error claiming winnings:', error);
    throw error;
  }
}; 