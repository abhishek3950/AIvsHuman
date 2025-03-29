import { ethers } from "hardhat";

async function main() {
  // Get the contract addresses from environment variables
  const aiAgentAddress = process.env.AI_AGENT_ADDRESS;
  const bettingContractAddress = process.env.BETTING_CONTRACT_ADDRESS;

  if (!aiAgentAddress) {
    throw new Error("AI_AGENT_ADDRESS environment variable not set");
  }
  if (!bettingContractAddress) {
    throw new Error("BETTING_CONTRACT_ADDRESS environment variable not set");
  }

  console.log("Updating BettingContract address in AIAgent...");
  console.log("AIAgent:", aiAgentAddress);
  console.log("New BettingContract:", bettingContractAddress);

  const aiAgent = await ethers.getContractAt("AIAgent", aiAgentAddress);
  const tx = await aiAgent.updateBettingContract(bettingContractAddress);
  await tx.wait();

  console.log("BettingContract address updated successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 