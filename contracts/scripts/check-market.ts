import { ethers } from "hardhat";

async function main() {
  const bettingContractAddress = "0xc38280B96A8810c127F7320a5bCD142dA4C8B5e6";

  console.log("\nChecking current market status...");

  const bettingContract = await ethers.getContractAt("BettingContractV2", bettingContractAddress);
  const currentMarket = await bettingContract.getCurrentMarket();
  const now = Math.floor(Date.now() / 1000);

  console.log("\nCurrent Market Details:");
  console.log("Market ID:", currentMarket.id.toString());
  console.log("Start Time:", new Date(Number(currentMarket.startTime) * 1000).toLocaleString());
  console.log("End Time:", new Date(Number(currentMarket.endTime) * 1000).toLocaleString());
  console.log("AI Prediction:", ethers.formatEther(currentMarket.aiPrediction), "USD");
  console.log("Total Over Bets:", ethers.formatEther(currentMarket.totalOverBets), "OVER tokens");
  console.log("Total Under Bets:", ethers.formatEther(currentMarket.totalUnderBets), "UNDER tokens");
  console.log("Settled:", currentMarket.settled);

  console.log("\nCurrent Time:", new Date(now * 1000).toLocaleString());
  console.log("Market Status:", now < Number(currentMarket.endTime) ? "Active" : "Ended");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
