import { ethers } from "hardhat";
import { config } from "dotenv";
import * as fs from "fs";

config();

async function main() {
  // Get environment variables
  const usdcAddress = ethers.getAddress("0x036cbd53842c5426634e7929541ec2318f3dcf7c"); // Base Sepolia USDC
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  // Deploy OverOrUnderToken
  console.log("\nDeploying OverOrUnderToken...");
  const OverOrUnderToken = await ethers.getContractFactory("OverOrUnderToken");
  const token = await OverOrUnderToken.deploy(
    usdcAddress,      // USDC address
    deployer.address, // Treasury (initially set to deployer)
    deployer.address  // USDC wallet (initially set to deployer)
  );
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("OverOrUnderToken deployed to:", tokenAddress);

  // Deploy BettingContract
  console.log("\nDeploying BettingContract...");
  const BettingContract = await ethers.getContractFactory("BettingContract");
  const betting = await BettingContract.deploy(
    tokenAddress,     // Token address
    deployer.address, // AI agent (initially set to deployer)
    deployer.address  // Treasury (initially set to deployer)
  );
  await betting.waitForDeployment();
  const bettingAddress = await betting.getAddress();
  console.log("BettingContract deployed to:", bettingAddress);

  // Deploy Faucet
  console.log("\nDeploying Faucet...");
  const Faucet = await ethers.getContractFactory("Faucet");
  const faucet = await Faucet.deploy(tokenAddress);
  await faucet.waitForDeployment();
  const faucetAddress = await faucet.getAddress();
  console.log("Faucet deployed to:", faucetAddress);

  // Fund contracts with initial tokens
  console.log("\nFunding contracts with initial tokens...");
  const bettingTokens = ethers.parseEther("1000000"); // 1M tokens for betting
  const faucetTokens = ethers.parseEther("100000");   // 100K tokens for faucet
  
  console.log("Transferring tokens to betting contract...");
  await token.transfer(bettingAddress, bettingTokens);
  
  console.log("Transferring tokens to faucet...");
  await token.transfer(faucetAddress, faucetTokens);
  
  console.log("Initial token transfers completed");

  // Log deployment summary
  console.log("\nDeployment Summary:");
  console.log("------------------");
  console.log("OverOrUnderToken:", tokenAddress);
  console.log("BettingContract:", bettingAddress);
  console.log("Faucet:", faucetAddress);
  console.log("USDC Address:", usdcAddress);
  console.log("Initial Betting Tokens:", ethers.formatEther(bettingTokens));
  console.log("Initial Faucet Tokens:", ethers.formatEther(faucetTokens));
  console.log("\nNote: Treasury, USDC wallet, and AI agent are all set to deployer address:", deployer.address);
  console.log("You can update these addresses later using the respective setter functions.");

  // Save deployment addresses to a file
  const deploymentInfo = {
    token: tokenAddress,
    betting: bettingAddress,
    faucet: faucetAddress,
    usdc: usdcAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    "deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\nDeployment information saved to deployment.json");

  // Update .env file
  const envContent = `PRIVATE_KEY=${process.env.PRIVATE_KEY}
RPC_URL=${process.env.RPC_URL}
USDC_ADDRESS=${usdcAddress}
TOKEN_CONTRACT_ADDRESS=${tokenAddress}
BETTING_CONTRACT_ADDRESS=${bettingAddress}
FAUCET_CONTRACT_ADDRESS=${faucetAddress}`;

  fs.writeFileSync(".env", envContent);
  console.log("\nEnvironment variables updated in .env file");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 