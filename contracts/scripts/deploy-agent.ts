import { ethers } from "hardhat";

async function main() {
  // Get the betting contract address from environment variable
  const bettingAddress = "0xFFF42F5cC652E9c8AcabE8Afb94e7B547a7D729B"; // New V2 contract address

  console.log("Deploying AIAgent contract...");
  const AIAgent = await ethers.getContractFactory("AIAgent");
  const aiAgent = await AIAgent.deploy(bettingAddress);
  await aiAgent.waitForDeployment();

  const aiAgentAddress = await aiAgent.getAddress();
  console.log("AIAgent deployed to:", aiAgentAddress);

  // Update the betting contract's AI agent address
  const BettingContractV2 = await ethers.getContractFactory("BettingContractV2");
  const bettingContract = BettingContractV2.attach(bettingAddress);
  
  const tx = await bettingContract.updateAiAgent(aiAgentAddress);
  await tx.wait();
  console.log("Updated BettingContractV2's AI agent address to:", aiAgentAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 