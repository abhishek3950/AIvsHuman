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
    return new ethers.BrowserProvider(window.ethereum);
  }
  throw new Error('No ethereum provider found');
};

export const getContract = async (withSigner = false) => {
  const provider = getProvider();
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
};

// Contract read functions
export const getCurrentMarket = async () => {
  const contract = await getContract();
  return contract.getCurrentMarket();
};

export const getUserBets = async (marketId: bigint, userAddress: string) => {
  const contract = await getContract();
  return contract.getUserBets(marketId, userAddress);
};

// Contract write functions
export const placeBet = async (marketId: bigint, isOver: boolean, amount: bigint) => {
  const contract = await getContract(true);
  const tx = await contract.placeBet(marketId, isOver, amount);
  return tx.wait();
};

export const claimWinnings = async (marketId: bigint) => {
  const contract = await getContract(true);
  const tx = await contract.claimWinnings(marketId);
  return tx.wait();
}; 