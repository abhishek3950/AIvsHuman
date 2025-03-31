import { ethers } from "hardhat";

async function main() {
  const bettingContractAddress = "0xc38280B96A8810c127F7320a5bCD142dA4C8B5e6";
  const userAddress = "0xf07C2dce70EC97ff0bb70A36c4ED0F8F85b22Ab4";

  console.log("Checking user bets...");
  console.log("Contract:", bettingContractAddress);
  console.log("User:", userAddress);

  const bettingContract = await ethers.getContractAt("BettingContractV2", bettingContractAddress);
  const currentMarket = await bettingContract.getCurrentMarket();
  
  console.log("\nCurrent Market ID:", currentMarket.id.toString());
  
  const userBets = await bettingContract.getUserBets(currentMarket.id, userAddress);
  console.log("\nUser Bets:");
  console.log("Over Bet:", ethers.formatEther(userBets.overBet), "OVER");
  console.log("Under Bet:", ethers.formatEther(userBets.underBet), "UNDER");
  console.log("Has Claimed:", userBets.hasClaimed);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 