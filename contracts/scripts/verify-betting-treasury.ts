import { ethers } from "hardhat";
import { BettingContract } from "../typechain-types";
import * as fs from "fs";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Read the betting address from deployment.json
  const deployment = JSON.parse(fs.readFileSync("deployment.json", "utf8"));
  const bettingAddress = deployment.betting;
  console.log("Betting contract address:", bettingAddress);

  // Get the treasury address from environment variables
  const treasuryAddress = process.env.TREASURY_ADDRESS;
  if (!treasuryAddress) {
    throw new Error("TREASURY_ADDRESS not set in environment variables");
  }
  console.log("Expected treasury address:", treasuryAddress);

  // Get the contract instance
  const BettingContract = await ethers.getContractFactory("BettingContract");
  const bettingContract = BettingContract.attach(bettingAddress) as BettingContract;

  // Check current treasury address
  const currentTreasury = await bettingContract.treasury();
  console.log("Current treasury address:", currentTreasury);

  // Check if we are the owner
  const owner = await bettingContract.owner();
  console.log("Contract owner:", owner);

  if (currentTreasury.toLowerCase() !== treasuryAddress.toLowerCase()) {
    console.log("Treasury address mismatch. Attempting to update...");
    try {
      // Call the updateTreasury function directly
      const tx = await bettingContract.updateTreasury(treasuryAddress);
      console.log("Transaction sent:", tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);

      if (receipt && receipt.status === 1) {
        console.log("Treasury address updated successfully");
        
        // Verify the update
        const newTreasury = await bettingContract.treasury();
        console.log("New treasury address:", newTreasury);
      } else {
        console.error("Transaction failed");
      }
    } catch (error) {
      console.error("Error updating treasury address:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
    }
  } else {
    console.log("Treasury address is correct");
  }

  // Log additional contract details
  const aiAgent = await bettingContract.aiAgent();
  const token = await bettingContract.token();
  console.log("AI Agent:", aiAgent);
  console.log("Token:", token);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 