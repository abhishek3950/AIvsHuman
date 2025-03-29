import { ethers } from "hardhat";
import axios from "axios";

async function main() {
  // Get the AI agent contract address from environment variable
  const aiAgentAddress = process.env.AI_AGENT_ADDRESS;
  if (!aiAgentAddress) {
    throw new Error("AI_AGENT_ADDRESS environment variable not set");
  }

  console.log("Fetching current BTC price...");
  const response = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
  const btcPrice = Math.floor(response.data.bitcoin.usd);
  console.log("Current BTC price:", btcPrice, "USD");

  // Calculate prediction (1% higher than current price)
  const prediction = btcPrice * 1.01;
  console.log("Prediction:", Math.floor(prediction), "USD");

  console.log("\nCreating new market...");
  const aiAgent = await ethers.getContractAt("AIAgent", aiAgentAddress);
  const tx = await aiAgent.updatePrice(ethers.parseEther(btcPrice.toString()));
  await tx.wait();
  console.log("Market created successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 