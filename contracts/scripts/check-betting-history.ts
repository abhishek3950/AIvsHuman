import { ethers } from "hardhat";

async function main() {
  const bettingContractAddress = "0xc38280B96A8810c127F7320a5bCD142dA4C8B5e6";
  const userAddress = "0xf07C2dce70EC97ff0bb70A36c4ED0F8F85b22Ab4";
  
  console.log("Checking betting history...");
  console.log("Contract Address:", bettingContractAddress);
  console.log("User Address:", userAddress);

  // Get contract instance
  const bettingContract = await ethers.getContractAt("BettingContractV2", bettingContractAddress);
  
  // Get total markets
  const marketsCount = await bettingContract.getMarketsCount();
  console.log("\nTotal Markets:", marketsCount.toString());

  // Check each market
  for (let i = 0; i < Number(marketsCount); i++) {
    const market = await bettingContract.getMarket(i);
    const userBets = await bettingContract.getUserBets(i, userAddress);
    
    console.log(`\nMarket ${i}:`);
    console.log("Start Time:", new Date(Number(market.startTime) * 1000).toLocaleString());
    console.log("End Time:", new Date(Number(market.endTime) * 1000).toLocaleString());
    console.log("AI Prediction:", ethers.formatEther(market.aiPrediction), "ETH");
    console.log("Actual Price:", ethers.formatEther(market.actualPrice), "ETH");
    console.log("Total Over Bets:", ethers.formatEther(market.totalOverBets), "ETH");
    console.log("Total Under Bets:", ethers.formatEther(market.totalUnderBets), "ETH");
    console.log("Settled:", market.settled);
    console.log("\nUser Bets:");
    console.log("Over Bet:", ethers.formatEther(userBets.overBet), "ETH");
    console.log("Under Bet:", ethers.formatEther(userBets.underBet), "ETH");
    console.log("Has Claimed:", userBets.hasClaimed);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 