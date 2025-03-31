import { ethers } from "hardhat";
import axios from "axios";
import { config } from "dotenv";

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

export async function autoSettleAndCreate() {
  const bettingContractAddress = process.env.BETTING_CONTRACT_ADDRESS;
  if (!bettingContractAddress) {
    throw new Error("BETTING_CONTRACT_ADDRESS not set in environment variables");
  }

  const aiAgentPrivateKey = process.env.AI_AGENT_PRIVATE_KEY;
  if (!aiAgentPrivateKey) {
    throw new Error("AI_AGENT_PRIVATE_KEY not set in environment variables");
  }
  
  console.log("Starting auto-settle and create market process...");
  console.log("Contract Address:", bettingContractAddress);

  // Create wallet with AI agent private key
  const wallet = new ethers.Wallet(aiAgentPrivateKey);
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const signer = wallet.connect(provider);

  // Get contract instance
  const bettingContract = await ethers.getContractAt("BettingContract", bettingContractAddress, signer);
  
  // Get current market details
  const currentMarket = await bettingContract.getCurrentMarket();
  console.log("\nCurrent Market Details:");
  console.log("Market ID:", currentMarket.id.toString());
  console.log("Start Time:", new Date(Number(currentMarket.startTime) * 1000).toLocaleString());
  console.log("End Time:", new Date(Number(currentMarket.endTime) * 1000).toLocaleString());
  console.log("AI Prediction:", ethers.formatEther(currentMarket.aiPrediction), "USD");
  console.log("Settled:", currentMarket.settled);

  // Check if market needs to be settled
  if (!currentMarket.settled && Date.now() >= Number(currentMarket.endTime) * 1000) {
    console.log("\nMarket has ended, settling...");
    
    // Get current BTC price for actual price
    const btcPrice = await getCurrentBTCPrice();
    const actualPrice = ethers.parseEther(btcPrice.toString());
    
    // Settle the market
    const settleTx = await bettingContract.settleMarket(currentMarket.id, actualPrice);
    console.log("Settlement transaction hash:", settleTx.hash);
    
    // Wait for transaction to be mined
    console.log("Waiting for settlement transaction to be mined...");
    const settleReceipt = await settleTx.wait();
    console.log("Settlement confirmed in block:", settleReceipt?.blockNumber);
    
    // Verify market is settled
    const settledMarket = await bettingContract.getMarket(currentMarket.id);
    console.log("\nMarket settlement verified:");
    console.log("Actual Price:", ethers.formatEther(settledMarket.actualPrice), "USD");
    console.log("Settled:", settledMarket.settled);
  }

  // Create new market if previous market is settled
  const marketsCount = await bettingContract.getMarketsCount();
  if (currentMarket.settled || marketsCount === BigInt(0)) {
    console.log("\nCreating new market...");
    
    // Get current BTC price for new market prediction
    const btcPrice = await getCurrentBTCPrice();
    const newAiPrediction = ethers.parseEther(btcPrice.toString());
    
    // Create the market
    const createTx = await bettingContract.createMarket(newAiPrediction);
    console.log("Market creation transaction hash:", createTx.hash);
    
    // Wait for transaction to be mined
    console.log("Waiting for market creation transaction to be mined...");
    const createReceipt = await createTx.wait();
    console.log("Market creation confirmed in block:", createReceipt?.blockNumber);
    
    // Verify new market
    const newMarket = await bettingContract.getCurrentMarket();
    console.log("\nNew Market Details:");
    console.log("Market ID:", newMarket.id.toString());
    console.log("Start Time:", new Date(Number(newMarket.startTime) * 1000).toLocaleString());
    console.log("End Time:", new Date(Number(newMarket.endTime) * 1000).toLocaleString());
    console.log("AI Prediction:", ethers.formatEther(newMarket.aiPrediction), "USD");
    console.log("Settled:", newMarket.settled);
  } else {
    console.log("\nCannot create new market: Previous market not settled");
  }
}

// Only run if called directly
if (require.main === module) {
  autoSettleAndCreate()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
} 