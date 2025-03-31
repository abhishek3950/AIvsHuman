import { ethers } from "hardhat";

async function main() {
  const bettingContractAddress = "0xc38280B96A8810c127F7320a5bCD142dA4C8B5e6";
  console.log("Creating new market in BettingContract V2...");
  console.log("Contract Address:", bettingContractAddress);

  // Get contract instance
  const bettingContract = await ethers.getContractAt("BettingContractV2", bettingContractAddress);
  
  // Set market parameters (BTC price prediction in USD)
  const aiPrediction = ethers.parseEther("69420"); // $69,420 BTC price prediction

  console.log("\nMarket Parameters:");
  console.log("BTC Price Prediction:", ethers.formatEther(aiPrediction), "USD");

  // Create market
  console.log("\nCreating market...");
  const tx = await bettingContract.createMarket(aiPrediction);
  console.log("Transaction hash:", tx.hash);
  
  // Wait for transaction to be mined
  console.log("Waiting for transaction to be mined...");
  const receipt = await tx.wait();
  console.log("Transaction confirmed in block:", receipt?.blockNumber);

  // Verify new market was created
  const currentMarket = await bettingContract.getCurrentMarket();
  const marketsCount = await bettingContract.getMarketsCount();
  
  console.log("\nNew Market Created:");
  console.log("Market ID:", currentMarket.id.toString());
  console.log("Total Markets:", marketsCount.toString());
  console.log("Start Time:", new Date(Number(currentMarket.startTime) * 1000).toLocaleString());
  console.log("End Time:", new Date(Number(currentMarket.endTime) * 1000).toLocaleString());
  console.log("BTC Price Prediction:", ethers.formatEther(currentMarket.aiPrediction), "USD");
  console.log("Current Time:", new Date().toLocaleString());
  console.log("Betting Window Open:", new Date(Number(currentMarket.startTime) * 1000) <= new Date() && new Date() <= new Date(Number(currentMarket.startTime + BigInt(240)) * 1000));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 