import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  // Base Sepolia USDC address
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7c";
  
  // Use deployer address as treasury and USDC wallet for now
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Deploying OverOrUnderToken contract...");
  const OverOrUnderToken = await ethers.getContractFactory("OverOrUnderToken");
  const token = await OverOrUnderToken.deploy(
    USDC_ADDRESS,      // USDC address
    deployer.address,  // Treasury address (using deployer for now)
    deployer.address   // USDC wallet address (using deployer for now)
  );
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();
  console.log("OverOrUnderToken deployed to:", tokenAddress);
  console.log("Please update TOKEN_CONTRACT_ADDRESS in your .env file with:", tokenAddress);
  
  // Log the contract details
  const usdc = await token.usdc();
  const treasury = await token.treasury();
  const usdcWallet = await token.usdcWallet();
  console.log("\nContract Details:");
  console.log("USDC Address:", usdc);
  console.log("Treasury Address:", treasury);
  console.log("USDC Wallet Address:", usdcWallet);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 