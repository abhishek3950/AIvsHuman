import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Updating BettingContract address in AIAgent...");

  const AI_AGENT_ADDRESS = process.env.AI_AGENT_ADDRESS;
  const BETTING_CONTRACT_ADDRESS = process.env.BETTING_CONTRACT_ADDRESS;

  if (!AI_AGENT_ADDRESS || !BETTING_CONTRACT_ADDRESS) {
    throw new Error("Required environment variables not set");
  }

  console.log("AIAgent:", AI_AGENT_ADDRESS);
  console.log("New BettingContract:", BETTING_CONTRACT_ADDRESS);

  const aiAgent = await ethers.getContractAt("AIAgent", AI_AGENT_ADDRESS);
  const tx = await aiAgent.updateBettingContract(BETTING_CONTRACT_ADDRESS);
  await tx.wait();

  console.log("BettingContract address updated successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 