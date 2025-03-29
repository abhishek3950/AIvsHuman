import { ethers } from "hardhat";

async function main() {
  // Get the betting contract address from environment variable
  const bettingAddress = process.env.BETTING_CONTRACT_ADDRESS;
  if (!bettingAddress) {
    throw new Error("BETTING_CONTRACT_ADDRESS not set in environment variables");
  }

  console.log("Deploying AIAgent contract...");
  const AIAgent = await ethers.getContractFactory("AIAgent");
  const aiAgent = await AIAgent.deploy(bettingAddress);
  await aiAgent.waitForDeployment();

  const aiAgentAddress = await aiAgent.getAddress();
  console.log("AIAgent deployed to:", aiAgentAddress);

  // Update the betting contract's AI agent address
  const BettingContract = await ethers.getContractFactory("BettingContract");
  const bettingContract = BettingContract.attach(bettingAddress);
  
  const tx = await bettingContract.updateAiAgent(aiAgentAddress);
  await tx.wait();
  console.log("Updated BettingContract's AI agent address to:", aiAgentAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 