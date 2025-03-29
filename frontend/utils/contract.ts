import { ethers } from 'ethers';
import { BETTING_CONTRACT_ABI, TOKEN_CONTRACT_ABI } from '@/contracts/abi';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_BETTING_CONTRACT_ADDRESS as string;
const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS as string;

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

export interface Bet {
  marketId: bigint;
  isOver: boolean;
  amount: bigint;
  claimed: boolean;
  market: {
    aiPrediction: bigint;
    actualPrice: bigint;
    totalOverBets: bigint;
    totalUnderBets: bigint;
    settled: boolean;
  };
}

// Get provider
export const getProvider = () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('Please install MetaMask to use this app');
  }
  return new ethers.BrowserProvider(window.ethereum);
};

// Get token contract
export const getTokenContract = async (withSigner = false) => {
  try {
    const provider = getProvider();
    const contract = new ethers.Contract(
      TOKEN_ADDRESS,
      TOKEN_CONTRACT_ABI,
      provider
    ) as ethers.Contract & {
      allowance(owner: string, spender: string): Promise<bigint>;
      approve(spender: string, amount: bigint): Promise<ethers.ContractTransactionResponse>;
    };

    if (withSigner) {
      const signer = await provider.getSigner();
      return contract.connect(signer) as typeof contract;
    }

    return contract;
  } catch (error) {
    console.error('Error creating token contract:', error);
    throw error;
  }
};

// Get betting contract
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
    const contract = await getContract();
    return contract.getCurrentMarket();
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

// Token functions
export const getTokenBalance = async () => {
  try {
    const tokenContract = await getTokenContract(true);
    const signer = await getProvider().getSigner();
    const balance = await tokenContract.balanceOf(await signer.getAddress());
    return balance;
  } catch (error) {
    console.error('Error getting token balance:', error);
    throw error;
  }
};

export const checkAllowance = async (amount: bigint) => {
  try {
    const tokenContract = await getTokenContract(true);
    const signer = await getProvider().getSigner();
    const allowance = await tokenContract.allowance(await signer.getAddress(), CONTRACT_ADDRESS);
    return allowance >= amount;
  } catch (error) {
    console.error('Error checking allowance:', error);
    throw error;
  }
};

export const approveTokens = async (amount: bigint) => {
  try {
    const tokenContract = await getTokenContract(true);
    const tx = await tokenContract.approve(CONTRACT_ADDRESS, amount);
    return tx.wait();
  } catch (error) {
    console.error('Error approving tokens:', error);
    throw error;
  }
};

// Contract write functions
export const placeBet = async (marketId: bigint, isOver: boolean, amount: bigint) => {
  try {
    // First check if we have enough allowance
    const hasAllowance = await checkAllowance(amount);
    if (!hasAllowance) {
      // Approve tokens first
      await approveTokens(amount);
    }

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

export async function getBettingHistory(): Promise<Bet[]> {
  if (!window.ethereum) throw new Error("No Ethereum provider found");
  const provider = new ethers.BrowserProvider(window.ethereum as any);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    BETTING_CONTRACT_ABI,
    provider
  );

  // Get current market
  const market = await contract.getCurrentMarket();
  const bets: Bet[] = [];

  // Get user bets for current market
  const userBets = await contract.getUserBets(market.id, address);

  if (userBets.overBet > BigInt(0)) {
    bets.push({
      marketId: market.id,
      isOver: true,
      amount: userBets.overBet,
      claimed: userBets.hasClaimed,
      market: {
        aiPrediction: market.aiPrediction,
        actualPrice: BigInt(0), // We don't have this in the current market data
        totalOverBets: market.totalOverBets,
        totalUnderBets: market.totalUnderBets,
        settled: market.settled
      }
    });
  }

  if (userBets.underBet > BigInt(0)) {
    bets.push({
      marketId: market.id,
      isOver: false,
      amount: userBets.underBet,
      claimed: userBets.hasClaimed,
      market: {
        aiPrediction: market.aiPrediction,
        actualPrice: BigInt(0), // We don't have this in the current market data
        totalOverBets: market.totalOverBets,
        totalUnderBets: market.totalUnderBets,
        settled: market.settled
      }
    });
  }

  return bets;
}

export function calculateWinnings(
  betAmount: bigint,
  totalWinningBets: bigint,
  totalLosingBets: bigint
): bigint {
  const PLATFORM_FEE = BigInt(10); // 10%
  const FEE_DENOMINATOR = BigInt(100);
  
  // Calculate total pool (winning + losing bets)
  const totalPool = totalWinningBets + totalLosingBets;
  
  // Calculate platform fee amount
  const platformFeeAmount = (totalPool * PLATFORM_FEE) / FEE_DENOMINATOR;
  
  // Calculate remaining pool after fee
  const remainingPool = totalPool - platformFeeAmount;
  
  // Calculate winnings based on bet proportion
  return (betAmount * remainingPool) / totalWinningBets;
} 