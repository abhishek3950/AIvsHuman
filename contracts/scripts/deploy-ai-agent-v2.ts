import { ethers } from "hardhat";

async function main() {
  // Get the betting contract address from environment variable
  const bettingContractAddress = process.env.BETTING_CONTRACT_ADDRESS;
  if (!bettingContractAddress) {
    throw new Error("BETTING_CONTRACT_ADDRESS environment variable not set");
  }

  console.log("Deploying updated AIAgent contract...");
  console.log("Using BettingContract at:", bettingContractAddress);

  // Deploy AIAgent
  const AIAgent = await ethers.getContractFactory("AIAgent");
  const aiAgent = await AIAgent.deploy(bettingContractAddress);
  await aiAgent.waitForDeployment();

  console.log("AIAgent deployed to:", await aiAgent.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 