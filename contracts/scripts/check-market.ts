import { ethers } from "hardhat";
import { BettingContractV2 } from "../typechain-types";

async function main() {
  const bettingAddress = process.env.BETTING_CONTRACT_ADDRESS;
  if (!bettingAddress) {
    throw new Error("BETTING_CONTRACT_ADDRESS not set");
  }

  console.log("Checking current market status...");
  const BettingContract = await ethers.getContractFactory("BettingContractV2");
  const betting = BettingContract.attach(bettingAddress) as BettingContractV2;

  const currentMarket = await betting.getCurrentMarket();
  const currentTime = Math.floor(Date.now() / 1000);

  console.log("\nCurrent Market Details:");
  console.log("Market ID:", currentMarket.id.toString());
  console.log("Start Time:", new Date(Number(currentMarket.startTime) * 1000).toLocaleString());
  console.log("End Time:", new Date(Number(currentMarket.endTime) * 1000).toLocaleString());
  console.log("AI Prediction:", ethers.formatEther(currentMarket.aiPrediction), "ETH");
  console.log("Total Over Bets:", ethers.formatEther(currentMarket.totalOverBets), "ETH");
  console.log("Total Under Bets:", ethers.formatEther(currentMarket.totalUnderBets), "ETH");
  console.log("Settled:", currentMarket.settled);
  console.log("\nCurrent Time:", new Date(currentTime * 1000).toLocaleString());
  console.log("Market Status:", currentTime > Number(currentMarket.endTime) ? "Ended" : "Active");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
