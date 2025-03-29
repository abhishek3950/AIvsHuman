import { ethers } from "hardhat";

async function main() {
  // Get the betting contract address from environment variable
  const bettingContractAddress = process.env.BETTING_CONTRACT_ADDRESS;
  if (!bettingContractAddress) {
    throw new Error("BETTING_CONTRACT_ADDRESS environment variable not set");
  }

  console.log("Verifying BettingContract...");
  console.log("Contract Address:", bettingContractAddress);

  const bettingContract = await ethers.getContractAt("BettingContract", bettingContractAddress);
  
  // Get contract state
  const owner = await bettingContract.owner();
  const aiAgent = await bettingContract.aiAgent();
  const treasury = await bettingContract.treasury();
  const token = await bettingContract.token();

  console.log("\nContract State:");
  console.log("Owner:", owner);
  console.log("Current AI Agent:", aiAgent);
  console.log("Treasury:", treasury);
  console.log("Token:", token);

  // Get current market details
  const [id, startTime, endTime, aiPrediction, totalOverBets, totalUnderBets, settled] = await bettingContract.getCurrentMarket();
  
  console.log("\nCurrent Market Details:");
  console.log("Market ID:", id.toString());
  console.log("Start Time:", new Date(Number(startTime) * 1000).toLocaleString());
  console.log("End Time:", new Date(Number(endTime) * 1000).toLocaleString());
  console.log("AI Prediction:", ethers.formatEther(aiPrediction), "ETH");
  console.log("Total Over Bets:", ethers.formatEther(totalOverBets), "ETH");
  console.log("Total Under Bets:", ethers.formatEther(totalUnderBets), "ETH");
  console.log("Settled:", settled);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 