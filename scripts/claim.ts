import { ethers } from "ethers";
import { BETTING_CONTRACT_ABI } from "../frontend/contracts/abi";

const BETTING_CONTRACT_ADDRESS = "0x594E9c7AD3361CE2B63D68F413e1A8d432BbC0bc";

async function main() {
  if (!process.env.PRIVATE_KEY) {
    throw new Error("Please set PRIVATE_KEY environment variable");
  }

  const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(BETTING_CONTRACT_ADDRESS, BETTING_CONTRACT_ABI, wallet);

  const marketId = BigInt(2); // Market #2
  console.log("Claiming winnings for market:", marketId.toString());
  console.log("User address:", wallet.address);

  // Get market data first to verify it's claimable
  const market = await contract.getMarket(marketId);
  console.log("Market data:", market);

  // Get user's bets for this market
  const userBets = await contract.getUserBets(marketId, wallet.address);
  console.log("User bets:", userBets);

  // Check if bet was won
  const isOverBetWon = market.settled && market.actualPrice > market.aiPrediction;
  const isUnderBetWon = market.settled && market.actualPrice < market.aiPrediction;
  
  console.log("Is over bet won:", isOverBetWon);
  console.log("Is under bet won:", isUnderBetWon);

  // Check if already claimed
  if (userBets.hasClaimed) {
    throw new Error("Already claimed");
  }

  // Claim winnings
  const tx = await contract.claimWinnings(marketId);
  console.log("Claim transaction sent:", tx.hash);
  await tx.wait();
  console.log("Claim transaction confirmed");
}

main().catch(console.error); 