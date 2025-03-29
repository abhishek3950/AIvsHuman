import { ethers } from "hardhat";

async function main() {
  const aiAgentAddress = "0xfA636eDB82Fc36B08B3e2fa6648A2b53B9fC8CB2";
  
  console.log("Making prediction...");
  const AIAgent = await ethers.getContractFactory("AIAgent");
  const aiAgent = AIAgent.attach(aiAgentAddress);
  
  const tx = await aiAgent.makePrediction();
  const receipt = await tx.wait();
  
  // Get the PredictionMade event
  const event = receipt.logs.find((log: any) => log.eventName === "PredictionMade");
  if (event) {
    const [timestamp, currentPrice, prediction] = event.args;
    console.log("\nPrediction Details:");
    console.log("Timestamp:", new Date(Number(timestamp) * 1000).toLocaleString());
    console.log("Current Price:", ethers.formatEther(currentPrice), "USD");
    console.log("Prediction:", ethers.formatEther(prediction), "USD");
    console.log("Price Impact:", "1% higher");
  }
  
  console.log("\nPrediction made successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 