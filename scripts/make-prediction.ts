import { ethers } from "hardhat";
import axios from "axios";

async function main() {
  // Get the AI agent address from environment variable
  const aiAgentAddress = process.env.AI_AGENT_ADDRESS;
  if (!aiAgentAddress) {
    throw new Error("AI_AGENT_ADDRESS not set in environment variables");
  }

  // Get current BTC price from CoinGecko
  const response = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
  const currentPrice = ethers.parseUnits(response.data.bitcoin.usd.toString(), 18);

  console.log("Current BTC price:", ethers.formatEther(currentPrice), "USD");

  // Get the AI agent contract
  const AIAgent = await ethers.getContractFactory("AIAgent");
  const aiAgent = AIAgent.attach(aiAgentAddress);

  // Make prediction
  console.log("Making prediction...");
  const tx = await aiAgent.updatePrice(currentPrice);
  await tx.wait();
  console.log("Prediction made successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 