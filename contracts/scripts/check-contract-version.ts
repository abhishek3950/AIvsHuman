import { ethers } from "hardhat";

async function main() {
  const bettingContractAddress = "0xb15f3fADCF8fbA7700a5f6fadc135DECd9bdBf65";
  console.log("Checking contract version and state...");
  console.log("Contract Address:", bettingContractAddress);

  // Try to get contract at address
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

  // Try to get markets count
  try {
    const marketsCount = await bettingContract.getMarketsCount();
    console.log("\nTotal Markets:", marketsCount.toString());
  } catch (error) {
    console.log("\nError getting markets count:", error);
    console.log("This might indicate we're using BettingContract V1");
  }

  // Get current market details
  const currentMarket = await bettingContract.getCurrentMarket();
  console.log("\nCurrent Market Details:");
  console.log("Market ID:", currentMarket.id.toString());
  console.log("Start Time:", new Date(Number(currentMarket.startTime) * 1000).toLocaleString());
  console.log("End Time:", new Date(Number(currentMarket.endTime) * 1000).toLocaleString());
  console.log("AI Prediction:", ethers.formatEther(currentMarket.aiPrediction), "ETH");
  console.log("Total Over Bets:", ethers.formatEther(currentMarket.totalOverBets), "ETH");
  console.log("Total Under Bets:", ethers.formatEther(currentMarket.totalUnderBets), "ETH");
  console.log("Settled:", currentMarket.settled);

  // Try to get previous markets
  if (currentMarket.id > BigInt(0)) {
    console.log("\nChecking previous markets...");
    for (let i = 0; i < 5; i++) { // Check last 5 markets
      try {
        const market = await bettingContract.getMarket(currentMarket.id - BigInt(i));
        console.log(`\nMarket ${(currentMarket.id - BigInt(i)).toString()}:`);
        console.log("Start Time:", new Date(Number(market.startTime) * 1000).toLocaleString());
        console.log("End Time:", new Date(Number(market.endTime) * 1000).toLocaleString());
        console.log("AI Prediction:", ethers.formatEther(market.aiPrediction), "ETH");
        console.log("Actual Price:", ethers.formatEther(market.actualPrice), "ETH");
        console.log("Total Over Bets:", ethers.formatEther(market.totalOverBets), "ETH");
        console.log("Total Under Bets:", ethers.formatEther(market.totalUnderBets), "ETH");
        console.log("Settled:", market.settled);
      } catch (error) {
        console.log(`Error getting market ${currentMarket.id - BigInt(i)}:`, error);
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 