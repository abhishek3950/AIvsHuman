import { ethers } from "hardhat";
import axios from "axios";
import { BettingContractV2 } from "../typechain-types";
import { AIAgent } from "../typechain-types";

async function main() {
  const aiAgentAddress = process.env.AI_AGENT_ADDRESS;
  if (!aiAgentAddress) {
    throw new Error("AI_AGENT_ADDRESS not set");
  }

  // Fetch current BTC price from CoinGecko
  console.log("Fetching current BTC price...");
  const response = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
  const currentPrice = response.data.bitcoin.usd;
  console.log("Current BTC price:", currentPrice, "USD");

  // Get the AIAgent contract
  const AIAgentFactory = await ethers.getContractFactory("AIAgent");
  const aiAgent = AIAgentFactory.attach(aiAgentAddress) as AIAgent;

  // Get current market ID from BettingContract
  const bettingAddress = process.env.BETTING_CONTRACT_ADDRESS;
  if (!bettingAddress) {
    throw new Error("BETTING_CONTRACT_ADDRESS not set");
  }

  const BettingContractFactory = await ethers.getContractFactory("BettingContractV2");
  const betting = BettingContractFactory.attach(bettingAddress) as BettingContractV2;
  const currentMarket = await betting.getCurrentMarket();
  const marketId = currentMarket.id;

  console.log("Settling market", marketId.toString(), "...");
  
  // Convert USD price to wei (multiply by 1e18 to match contract's precision)
  const priceInWei = ethers.parseUnits(currentPrice.toString(), 18);

  // Settle the market
  const tx = await aiAgent.settleMarket(marketId, priceInWei);
  await tx.wait();

  console.log("Market settled successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 