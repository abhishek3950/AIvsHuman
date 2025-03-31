import { ethers } from "hardhat";
import { config } from "dotenv";

config();

async function main() {
  const bettingContractAddress = process.env.BETTING_CONTRACT_ADDRESS;
  if (!bettingContractAddress) {
    throw new Error("BETTING_CONTRACT_ADDRESS not set in environment variables");
  }

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY not set in environment variables");
  }

  console.log("Placing bet...");
  console.log("Contract Address:", bettingContractAddress);

  // Create wallet with private key
  const wallet = new ethers.Wallet(privateKey);
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const signer = wallet.connect(provider);

  // Get contract instance
  const bettingContract = await ethers.getContractAt("BettingContract", bettingContractAddress, signer);
  
  // Get current market details
  const currentMarket = await bettingContract.getCurrentMarket();
  console.log("\nCurrent Market Details:");
  console.log("Market ID:", currentMarket.id.toString());
  console.log("Start Time:", new Date(Number(currentMarket.startTime) * 1000).toLocaleString());
  console.log("End Time:", new Date(Number(currentMarket.endTime) * 1000).toLocaleString());
  console.log("AI Prediction:", ethers.formatEther(currentMarket.aiPrediction), "USD");
  console.log("Settled:", currentMarket.settled);

  // Place bet
  const betAmount = ethers.parseEther("10"); // 10 tokens
  const isOver = false; // Betting UNDER
  
  console.log("\nPlacing bet...");
  console.log("Amount:", ethers.formatEther(betAmount), "UNDER");
  
  const tx = await bettingContract.placeBet(currentMarket.id, isOver, betAmount);
  console.log("Transaction hash:", tx.hash);
  
  // Wait for transaction to be mined
  console.log("Waiting for transaction to be mined...");
  const receipt = await tx.wait();
  console.log("Transaction confirmed in block:", receipt?.blockNumber);

  // Verify bet
  const userBets = await bettingContract.getUserBets(currentMarket.id, await signer.getAddress());
  console.log("\nUser Bets:");
  console.log("Over Bet:", ethers.formatEther(userBets.overBet), "OVER");
  console.log("Under Bet:", ethers.formatEther(userBets.underBet), "UNDER");
  console.log("Has Claimed:", userBets.hasClaimed);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 