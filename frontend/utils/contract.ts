import { ethers } from 'ethers';
import { BETTING_CONTRACT_ABI, TOKEN_CONTRACT_ABI } from '@/contracts/abi';

// Log all environment variables
console.log('Environment variables:', {
  NEXT_PUBLIC_BETTING_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_BETTING_CONTRACT_ADDRESS,
  NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS,
  NEXT_PUBLIC_AI_AGENT_ADDRESS: process.env.NEXT_PUBLIC_AI_AGENT_ADDRESS,
  NEXT_PUBLIC_FAUCET_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_FAUCET_CONTRACT_ADDRESS,
  NEXT_PUBLIC_USDC_ADDRESS: process.env.NEXT_PUBLIC_USDC_ADDRESS
});

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_BETTING_CONTRACT_ADDRESS as string;
const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS as string;

if (!CONTRACT_ADDRESS) {
  throw new Error('NEXT_PUBLIC_BETTING_CONTRACT_ADDRESS environment variable not set');
}

if (!TOKEN_ADDRESS) {
  throw new Error('NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS environment variable not set');
}

console.log('Contract addresses:', {
  betting: CONTRACT_ADDRESS,
  token: TOKEN_ADDRESS
});

// Types
export interface MarketData {
  id: bigint;
  startTime: bigint;
  endTime: bigint;
  aiPrediction: bigint;
  actualPrice: bigint;
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
  claimTxHash?: string;
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
      getMarket(marketId: bigint): Promise<MarketData>;
      getClaimTransaction(marketId: bigint, userAddress: string): Promise<string>;
      getMarketsCount(): Promise<bigint>;
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
    console.log('Getting token balance...');
    console.log('Token address:', TOKEN_ADDRESS);
    console.log('Token ABI:', TOKEN_CONTRACT_ABI);
    
    const tokenContract = await getTokenContract(true);
    console.log('Token contract created successfully');
    
    const signer = await getProvider().getSigner();
    const address = await signer.getAddress();
    console.log('Checking balance for address:', address);
    
    // Log the contract methods
    console.log('Available contract methods:', Object.keys(tokenContract));
    
    const balance = await tokenContract.balanceOf(address);
    console.log('Raw balance:', balance.toString());
    console.log('Formatted balance:', ethers.formatEther(balance));
    return balance;
  } catch (error) {
    console.error('Error getting token balance:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    throw error;
  }
};

export const checkAllowance = async (amount: bigint) => {
  try {
    console.log('Checking allowance with token address:', TOKEN_ADDRESS);
    console.log('Checking allowance for betting contract:', CONTRACT_ADDRESS);
    
    const tokenContract = await getTokenContract(true);
    const signer = await getProvider().getSigner();
    const address = await signer.getAddress();
    console.log('Checking allowance for address:', address);
    
    const allowance = await tokenContract.allowance(address, CONTRACT_ADDRESS);
    console.log('Current allowance:', allowance.toString());
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
    return tx;
  } catch (error) {
    console.error('Error approving tokens:', error);
    throw error;
  }
};

// Contract write functions
export const placeBet = async (marketId: bigint, isOver: boolean, amount: bigint) => {
  try {
    console.log('Placing bet with amount:', amount.toString());
    
    // First check if we have enough allowance
    const hasAllowance = await checkAllowance(amount);
    console.log('Has allowance:', hasAllowance);
    
    if (!hasAllowance) {
      console.log('Approving tokens...');
      // Approve tokens first with a higher amount to avoid multiple approvals
      const approvalAmount = amount * BigInt(100); // Approve 100x the bet amount
      console.log('Approval amount:', approvalAmount.toString());
      console.log('Token address:', TOKEN_ADDRESS);
      console.log('Betting contract address:', CONTRACT_ADDRESS);
      
      const tokenContract = await getTokenContract(true);
      const signer = await getProvider().getSigner();
      const signerAddress = await signer.getAddress();
      console.log('Signer address:', signerAddress);
      
      // Check current allowance again
      const currentAllowance = await tokenContract.allowance(signerAddress, CONTRACT_ADDRESS);
      console.log('Current allowance:', currentAllowance.toString());
      
      // Only approve if current allowance is less than needed
      if (currentAllowance < amount) {
        const approvalTx = await approveTokens(approvalAmount);
        console.log('Approval transaction:', approvalTx.hash);
        // Wait for approval transaction to be mined
        await approvalTx.wait();
        console.log('Approval confirmed');
        
        // Verify allowance after approval
        const newAllowance = await tokenContract.allowance(signerAddress, CONTRACT_ADDRESS);
        console.log('New allowance after approval:', newAllowance.toString());
        
        if (newAllowance < amount) {
          throw new Error('Approval failed - allowance not set correctly');
        }
      } else {
        console.log('Existing allowance is sufficient');
      }
    }

    // Now place the bet
    const contract = await getContract(true);
    console.log('Placing bet...');
    const tx = await contract.placeBet(marketId, isOver, amount);
    console.log('Bet transaction:', tx.hash);
    return tx;
  } catch (error) {
    console.error('Error placing bet:', error);
    throw error;
  }
};

export const claimWinnings = async (marketId: bigint) => {
  try {
    const contract = await getContract(true);
    const tx = await contract.claimWinnings(marketId);
    return tx;
  } catch (error) {
    console.error('Error claiming winnings:', error);
    throw error;
  }
};

export async function getBettingHistory(): Promise<Bet[]> {
  try {
    const contract = await getContract();
    const signer = await getProvider().getSigner();
    const address = await signer.getAddress();
    console.log('Getting betting history for address:', address);

    // Get current market to determine the latest market ID
    const currentMarket = await contract.getCurrentMarket();
    console.log('Current market:', currentMarket);
    
    // If there are no markets yet, return empty array
    if (currentMarket.id === BigInt(0) && currentMarket.startTime === BigInt(0)) {
      console.log('No markets found');
      return [];
    }

    const bets: Bet[] = [];
    let marketId = currentMarket.id;
    let consecutiveErrors = 0;
    const MAX_CONSECUTIVE_ERRORS = 5; // Stop after 5 consecutive errors

    // Keep trying markets until we hit too many consecutive errors
    while (consecutiveErrors < MAX_CONSECUTIVE_ERRORS && marketId >= BigInt(0)) {
      try {
        console.log(`Trying market ${marketId.toString()}`);
        
        // Get user's bets for this market first
        const userBets = await contract.getUserBets(marketId, address);
        console.log(`User bets for market ${marketId.toString()}:`, userBets);
        
        // Only try to get market data if user has bets
        if (userBets.overBet > BigInt(0) || userBets.underBet > BigInt(0)) {
          // Try to get market data, fall back to current market if it fails
          let market: MarketData;
          try {
            market = await contract.getMarket(marketId);
            console.log(`Market ${marketId.toString()} data:`, market);
          } catch (error) {
            console.log(`Failed to get market ${marketId} data, using current market data`);
            market = currentMarket;
          }
          
          // Try to get claim transaction hash, but don't fail if it's not available
          let claimTxHash: string | undefined;
          try {
            claimTxHash = await contract.getClaimTransaction(marketId, address);
            console.log(`Claim transaction hash for market ${marketId.toString()}:`, claimTxHash);
            // If the hash is all zeros or empty, treat it as undefined
            if (!claimTxHash || claimTxHash === "0x0000000000000000000000000000000000000000000000000000000000000000") {
              claimTxHash = undefined;
            }
          } catch (error) {
            // Log but don't fail if getClaimTransaction is not available
            console.log(`getClaimTransaction not available for market ${marketId}:`, error);
            claimTxHash = undefined;
          }

          // Add over bet if exists
          if (userBets.overBet > BigInt(0)) {
            console.log(`Adding over bet for market ${marketId.toString()}`);
            bets.push({
              marketId,
              isOver: true,
              amount: userBets.overBet,
              claimed: userBets.hasClaimed,
              claimTxHash,
              market: {
                aiPrediction: market.aiPrediction,
                actualPrice: market.actualPrice,
                totalOverBets: market.totalOverBets,
                totalUnderBets: market.totalUnderBets,
                settled: market.settled
              }
            });
          }

          // Add under bet if exists
          if (userBets.underBet > BigInt(0)) {
            console.log(`Adding under bet for market ${marketId.toString()}`);
            bets.push({
              marketId,
              isOver: false,
              amount: userBets.underBet,
              claimed: userBets.hasClaimed,
              claimTxHash,
              market: {
                aiPrediction: market.aiPrediction,
                actualPrice: market.actualPrice,
                totalOverBets: market.totalOverBets,
                totalUnderBets: market.totalUnderBets,
                settled: market.settled
              }
            });
          }
        }

        // Reset consecutive errors counter since we found a valid market
        consecutiveErrors = 0;
        
        // Move to previous market
        marketId -= BigInt(1);
      } catch (error) {
        console.log(`Error fetching market ${marketId}:`, error);
        consecutiveErrors++;
        marketId -= BigInt(1);
      }
    }

    console.log('Total bets found:', bets.length);
    // Sort bets by market ID in descending order (newest first)
    return bets.sort((a, b) => Number(b.marketId - a.marketId));
  } catch (error) {
    console.error('Error getting betting history:', error);
    throw error;
  }
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

// Add function to get block explorer URL
export function getBlockExplorerUrl(txHash: string): string {
  return `https://sepolia.basescan.org/tx/${txHash}`;
} 