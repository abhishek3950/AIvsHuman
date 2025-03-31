import { ethers } from "hardhat";

async function main() {
  const aiAgentAddress = "0xfdA7F22fB68841AFc8F3dA9a837dD08DE96C18da";
  
  console.log("Checking AI Agent contract...");
  console.log("AI Agent Address:", aiAgentAddress);

  const aiAgent = await ethers.getContractAt("AIAgent", aiAgentAddress);
  
  // Get owner
  const owner = await aiAgent.owner();
  console.log("\nAI Agent Owner:", owner);
  
  // Get betting contract
  const bettingContract = await aiAgent.bettingContract();
  console.log("Betting Contract:", bettingContract);
  
  // Get last update time
  const lastUpdateTime = await aiAgent.lastUpdateTime();
  console.log("Last Update Time:", new Date(Number(lastUpdateTime) * 1000).toLocaleString());
  
  // Get deployer address
  const [deployer] = await ethers.getSigners();
  console.log("\nCurrent Deployer:", deployer.address);
  console.log("Is Deployer Owner:", deployer.address.toLowerCase() === owner.toLowerCase());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 