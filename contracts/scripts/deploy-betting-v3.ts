import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Get contract addresses from environment variables
  const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
  const AI_AGENT_ADDRESS = process.env.AI_AGENT_ADDRESS;
  const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS;

  if (!TOKEN_ADDRESS || !AI_AGENT_ADDRESS || !TREASURY_ADDRESS) {
    throw new Error("Required environment variables not set");
  }

  // Deploy BettingContract
  const BettingContract = await ethers.getContractFactory("BettingContract");
  const bettingContract = await BettingContract.deploy(
    TOKEN_ADDRESS,
    AI_AGENT_ADDRESS,
    TREASURY_ADDRESS
  );

  await bettingContract.waitForDeployment();
  const bettingContractAddress = await bettingContract.getAddress();

  console.log("BettingContract deployed to:", bettingContractAddress);
  console.log("Using Token:", TOKEN_ADDRESS);
  console.log("Using AI Agent:", AI_AGENT_ADDRESS);
  console.log("Using Treasury:", TREASURY_ADDRESS);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 