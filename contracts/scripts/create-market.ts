import { ethers } from "hardhat";
import axios from "axios";

async function main() {
  // Get the betting contract address
  const bettingContractAddress = "0xb15f3fADCF8fbA7700a5f6fadc135DECd9bdBf65";

  // Check betting contract state
  console.log("\nChecking betting contract state...");
  const bettingContract = await ethers.getContractAt("BettingContract", bettingContractAddress);
  const owner = await bettingContract.owner();
  const currentAiAgent = await bettingContract.aiAgent();
  const treasury = await bettingContract.treasury();
  const token = await bettingContract.token();
  
  console.log("Owner:", owner);
  console.log("Current AI Agent:", currentAiAgent);
  console.log("Treasury:", treasury);
  console.log("Token:", token);

  // Get current market state
  console.log("\nChecking current market state...");
  const currentMarket = await bettingContract.getCurrentMarket();
  console.log("Current Market:", {
    id: currentMarket.id.toString(),
    startTime: new Date(Number(currentMarket.startTime) * 1000).toLocaleString(),
    endTime: new Date(Number(currentMarket.endTime) * 1000).toLocaleString(),
    aiPrediction: ethers.formatEther(currentMarket.aiPrediction),
    totalOverBets: ethers.formatEther(currentMarket.totalOverBets),
    totalUnderBets: ethers.formatEther(currentMarket.totalUnderBets),
    settled: currentMarket.settled
  });

  // Get current BTC price
  console.log("\nFetching current BTC price...");
  const response = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
  const btcPrice = Math.floor(response.data.bitcoin.usd);
  console.log("Current BTC price:", btcPrice, "USD");

  // Calculate prediction (1% higher than current price)
  const prediction = btcPrice * 1.01;
  console.log("Prediction:", Math.floor(prediction), "USD");

  // Create new market
  console.log("\nCreating new market...");
  try {
    const tx = await bettingContract.createMarket(ethers.parseEther(btcPrice.toString()));
    console.log("Transaction hash:", tx.hash);
    console.log("Waiting for transaction confirmation...");
    await tx.wait();
    console.log("Market created successfully!");

    // Check new market state
    console.log("\nChecking new market state...");
    const newMarket = await bettingContract.getCurrentMarket();
    console.log("New Market:", {
      id: newMarket.id.toString(),
      startTime: new Date(Number(newMarket.startTime) * 1000).toLocaleString(),
      endTime: new Date(Number(newMarket.endTime) * 1000).toLocaleString(),
      aiPrediction: ethers.formatEther(newMarket.aiPrediction),
      totalOverBets: ethers.formatEther(newMarket.totalOverBets),
      totalUnderBets: ethers.formatEther(newMarket.totalUnderBets),
      settled: newMarket.settled
    });
  } catch (error: any) {
    console.error("\nError creating market:", error);
    if ('transaction' in error) {
      console.error("Transaction:", error.transaction);
    }
    if ('receipt' in error) {
      console.error("Receipt:", error.receipt);
    }
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 