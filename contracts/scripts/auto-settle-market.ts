import { ethers } from "hardhat";
import axios from "axios";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

async function main() {
  try {
    console.log("Starting auto-settle check...");
    
    // Get contract instance
    const bettingContract = await ethers.getContractAt("BettingContractV2", "0x12348Bb035e8F259C455006fA7caB9Ea4879e7Fe");
    const aiAgent = await ethers.getContractAt("AIAgent", "0x3aeF04b2cbD6Be6c8E69c85095349CAbCBbAF976");
    
    console.log("Contracts loaded successfully");
    console.log("BettingContract address:", await bettingContract.getAddress());
    console.log("AIAgent address:", await aiAgent.getAddress());

    // Get current market
    console.log("Fetching current market...");
    const market = await bettingContract.getCurrentMarket();
    const now = Math.floor(Date.now() / 1000);
    const endTime = Number(market.endTime);

    console.log("Market details:", {
      id: market.id.toString(),
      endTime: new Date(endTime * 1000).toISOString(),
      now: new Date(now * 1000).toISOString(),
      settled: market.settled,
      timeRemaining: endTime - now
    });

    // Check if market has ended and not settled
    if (now >= endTime && !market.settled) {
      console.log("Market has ended and needs settlement");

      // Get current BTC price from CoinGecko
      console.log("Fetching current BTC price from CoinGecko...");
      const response = await axios.get(`${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd`);
      const currentPrice = response.data.bitcoin.usd;
      console.log("Current BTC price:", currentPrice);

      // Convert price to wei (multiply by 1e18)
      const priceInWei = ethers.parseEther(currentPrice.toString());
      console.log("Price in wei:", priceInWei.toString());

      // Settle market using AI agent
      console.log("Settling market...");
      const tx = await aiAgent.settleMarket(market.id, priceInWei);
      console.log("Settlement transaction sent:", tx.hash);
      await tx.wait();
      console.log("Market settled successfully!");
    }

    // Create new market if current one is settled
    if (market.settled) {
      console.log("Creating new market...");
      const response = await axios.get(`${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd`);
      const currentPrice = response.data.bitcoin.usd;
      const priceInWei = ethers.parseEther(currentPrice.toString());
      
      const createTx = await aiAgent.updatePrice(priceInWei);
      console.log("Create market transaction sent:", createTx.hash);
      await createTx.wait();
      console.log("New market created successfully!");
    } else {
      console.log("Market is still active");
    }
  } catch (error) {
    console.error("Error in auto-settle script:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack
      });
    }
    throw error; // Re-throw to ensure the process exits with error code
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 