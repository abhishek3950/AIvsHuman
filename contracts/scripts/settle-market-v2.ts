import { ethers } from "hardhat";
import { config } from "dotenv";
import axios from "axios";

config();

const COINGECKO_API = "https://api.coingecko.com/api/v3";

async function getCurrentBTCPrice(): Promise<number> {
  try {
    const response = await axios.get(`${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd`);
    return response.data.bitcoin.usd;
  } catch (error) {
    console.error("Error fetching BTC price:", error);
    throw error;
  }
}

async function main() {
  const bettingContractAddress = process.env.BETTING_CONTRACT_ADDRESS;
  if (!bettingContractAddress) {
    throw new Error("BETTING_CONTRACT_ADDRESS not set in environment variables");
  }

  const aiAgentPrivateKey = process.env.AI_AGENT_PRIVATE_KEY;
  if (!aiAgentPrivateKey) {
    throw new Error("AI_AGENT_PRIVATE_KEY not set in environment variables");
  }

  console.log("Settling market...");
  console.log("Betting Contract:", bettingContractAddress);

  // Create wallet with AI agent's private key
  const wallet = new ethers.Wallet(aiAgentPrivateKey);
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const signer = wallet.connect(provider);

  // Get betting contract instance
  const bettingContract = await ethers.getContractAt("BettingContract", bettingContractAddress, signer);
  
  // Get current market
  const currentMarket = await bettingContract.getCurrentMarket();
  console.log("\nCurrent Market Details:");
  console.log("Market ID:", currentMarket.id);
  console.log("AI Prediction:", ethers.formatEther(currentMarket.aiPrediction), "USD");
  console.log("Start Time:", new Date(Number(currentMarket.startTime) * 1000).toLocaleString());
  console.log("End Time:", new Date(Number(currentMarket.endTime) * 1000).toLocaleString());
  console.log("Settled:", currentMarket.settled);

  if (currentMarket.settled) {
    console.log("\nMarket already settled!");
    return;
  }

  // Get current BTC price
  const btcPrice = await getCurrentBTCPrice();
  const actualPrice = ethers.parseEther(btcPrice.toString());
  console.log("\nCurrent BTC Price:", btcPrice, "USD");
  
  // Settle market
  const tx = await bettingContract.settleMarket(currentMarket.id, actualPrice);
  console.log("Transaction hash:", tx.hash);
  
  // Wait for transaction to be mined
  console.log("Waiting for transaction to be mined...");
  const receipt = await tx.wait();
  console.log("Transaction confirmed in block:", receipt?.blockNumber);

  // Verify settlement
  const updatedMarket = await bettingContract.getMarket(currentMarket.id);
  console.log("\nUpdated Market Details:");
  console.log("Settled:", updatedMarket.settled);
  console.log("Actual Price:", ethers.formatEther(actualPrice), "USD");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 