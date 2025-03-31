import { ethers } from "hardhat";

async function main() {
  const bettingContractAddress = "0xb15f3fADCF8fbA7700a5f6fadc135DECd9bdBf65";
  const aiAgentAddress = "0xfdA7F22fB68841AFc8F3dA9a837dD08DE96C18da";
  
  console.log("Checking market settlement status...");
  console.log("Contract Address:", bettingContractAddress);
  console.log("AI Agent Address:", aiAgentAddress);

  const bettingContract = await ethers.getContractAt("BettingContract", bettingContractAddress);
  const aiAgent = await ethers.getContractAt("AIAgent", aiAgentAddress);
  
  // Get current market
  const currentMarket = await bettingContract.getCurrentMarket();
  console.log("\nCurrent Market:");
  console.log("Market ID:", currentMarket.id.toString());
  console.log("Start Time:", new Date(Number(currentMarket.startTime) * 1000).toLocaleString());
  console.log("End Time:", new Date(Number(currentMarket.endTime) * 1000).toLocaleString());
  console.log("AI Prediction:", ethers.formatEther(currentMarket.aiPrediction), "ETH");
  console.log("Total Over Bets:", ethers.formatEther(currentMarket.totalOverBets), "ETH");
  console.log("Total Under Bets:", ethers.formatEther(currentMarket.totalUnderBets), "ETH");
  console.log("Settled:", currentMarket.settled);

  // Check if market should be settled
  const now = Math.floor(Date.now() / 1000);
  const endTime = Number(currentMarket.endTime);
  
  console.log("\nTime Check:");
  console.log("Current Time:", new Date(now * 1000).toLocaleString());
  console.log("Market End Time:", new Date(endTime * 1000).toLocaleString());
  console.log("Should be settled:", now >= endTime);

  if (now >= endTime && !currentMarket.settled) {
    console.log("\nMarket should be settled but isn't. Attempting to settle...");
    try {
      // Get current BTC price (you'll need to implement this)
      const currentPrice = BigInt(81690 * 10**18); // Example price
      
      // Try to settle the market
      const tx = await aiAgent.settleMarket(currentMarket.id, currentPrice);
      await tx.wait();
      console.log("Market settled successfully!");
    } catch (error) {
      console.log("Error settling market:", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 