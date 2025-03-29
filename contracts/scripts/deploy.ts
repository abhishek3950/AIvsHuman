import { ethers } from "hardhat";
import { config } from "dotenv";

config();

async function main() {
  // Get environment variables
  const usdcAddress = process.env.USDC_ADDRESS;
  const treasuryAddress = process.env.TREASURY_ADDRESS;
  const usdcWalletAddress = process.env.USDC_WALLET_ADDRESS;
  const aiAgentAddress = process.env.AI_AGENT_ADDRESS;

  if (!usdcAddress || !treasuryAddress || !usdcWalletAddress || !aiAgentAddress) {
    throw new Error("Missing required environment variables");
  }

  console.log("Starting deployment...");

  // Deploy OverOrUnderToken
  console.log("\nDeploying OverOrUnderToken...");
  const OverOrUnderToken = await ethers.getContractFactory("OverOrUnderToken");
  const token = await OverOrUnderToken.deploy(
    usdcAddress,
    treasuryAddress,
    usdcWalletAddress
  );
  await token.deployed();
  console.log("OverOrUnderToken deployed to:", token.address);

  // Deploy BettingContract
  console.log("\nDeploying BettingContract...");
  const BettingContract = await ethers.getContractFactory("BettingContract");
  const betting = await BettingContract.deploy(
    token.address,
    aiAgentAddress,
    treasuryAddress
  );
  await betting.deployed();
  console.log("BettingContract deployed to:", betting.address);

  // Transfer initial tokens to betting contract
  console.log("\nTransferring initial tokens to betting contract...");
  const initialTokens = ethers.parseEther("1000000"); // 1M tokens
  await token.transfer(betting.address, initialTokens);
  console.log("Initial tokens transferred successfully");

  // Set up AI agent address in betting contract
  console.log("\nSetting up AI agent address...");
  await betting.setAIAgent(aiAgentAddress);
  console.log("AI agent address set successfully");

  // Log deployment summary
  console.log("\nDeployment Summary:");
  console.log("------------------");
  console.log("OverOrUnderToken:", token.address);
  console.log("BettingContract:", betting.address);
  console.log("USDC Address:", usdcAddress);
  console.log("Treasury Address:", treasuryAddress);
  console.log("USDC Wallet Address:", usdcWalletAddress);
  console.log("AI Agent Address:", aiAgentAddress);
  console.log("Initial Tokens:", ethers.formatEther(initialTokens));

  // Save deployment addresses to a file
  const fs = require("fs");
  const deploymentInfo = {
    token: token.address,
    betting: betting.address,
    usdc: usdcAddress,
    treasury: treasuryAddress,
    usdcWallet: usdcWalletAddress,
    aiAgent: aiAgentAddress,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    "deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\nDeployment information saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 