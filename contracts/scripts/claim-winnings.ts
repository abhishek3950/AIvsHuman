import { ethers } from "hardhat";
import { config } from "dotenv";

config();

async function main() {
  const bettingContractAddress = process.env.BETTING_CONTRACT_ADDRESS;
  if (!bettingContractAddress) {
    throw new Error("BETTING_CONTRACT_ADDRESS not set in environment variables");
  }

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY not set in environment variables");
  }

  console.log("Claiming winnings...");
  console.log("Betting Contract:", bettingContractAddress);

  // Create wallet with private key
  const wallet = new ethers.Wallet(privateKey);
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const signer = wallet.connect(provider);

  // Get betting contract instance
  const bettingContract = await ethers.getContractAt("BettingContract", bettingContractAddress, signer);
  
  // Get current market
  const currentMarket = await bettingContract.getCurrentMarket();
  const userAddress = await signer.getAddress();
  
  // Get user's bets for current market
  const userBets = await bettingContract.getUserBets(currentMarket.id, userAddress);
  
  if (userBets.hasClaimed) {
    console.log("Winnings already claimed for current market");
    return;
  }

  if (!currentMarket.settled) {
    console.log("Market not settled yet");
    return;
  }

  console.log("\nClaiming winnings for market:", currentMarket.id.toString());
  console.log("User Bets:");
  console.log("Over Bet:", ethers.formatEther(userBets.overBet), "OVER");
  console.log("Under Bet:", ethers.formatEther(userBets.underBet), "UNDER");
  
  // Claim winnings
  const tx = await bettingContract.claimWinnings(currentMarket.id);
  console.log("Transaction hash:", tx.hash);
  
  // Wait for transaction to be mined
  console.log("Waiting for transaction to be mined...");
  const receipt = await tx.wait();
  console.log("Transaction confirmed in block:", receipt?.blockNumber);

  // Verify claim status
  const updatedUserBets = await bettingContract.getUserBets(currentMarket.id, userAddress);
  console.log("\nUpdated Claim Status:");
  console.log("Has Claimed:", updatedUserBets.hasClaimed);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 