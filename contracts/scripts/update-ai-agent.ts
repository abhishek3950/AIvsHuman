import { ethers } from "hardhat";

async function main() {
  // Get the contract addresses from environment variables
  const bettingContractAddress = process.env.BETTING_CONTRACT_ADDRESS;
  const aiAgentAddress = process.env.AI_AGENT_ADDRESS;

  if (!bettingContractAddress) {
    throw new Error("BETTING_CONTRACT_ADDRESS environment variable not set");
  }
  if (!aiAgentAddress) {
    throw new Error("AI_AGENT_ADDRESS environment variable not set");
  }

  console.log("Updating AI agent address in BettingContract...");
  console.log("BettingContract:", bettingContractAddress);
  console.log("New AI Agent:", aiAgentAddress);

  const bettingContract = await ethers.getContractAt("BettingContract", bettingContractAddress);
  const tx = await bettingContract.updateAiAgent(aiAgentAddress);
  await tx.wait();

  console.log("AI agent address updated successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 