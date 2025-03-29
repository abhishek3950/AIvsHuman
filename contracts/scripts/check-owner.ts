import { ethers } from "hardhat";

async function main() {
  // Get the betting contract address from environment variable
  const bettingContractAddress = process.env.BETTING_CONTRACT_ADDRESS;
  if (!bettingContractAddress) {
    throw new Error("BETTING_CONTRACT_ADDRESS environment variable not set");
  }

  console.log("Checking BettingContract owner...");
  const bettingContract = await ethers.getContractAt("BettingContract", bettingContractAddress);
  const owner = await bettingContract.owner();
  const [signer] = await ethers.getSigners();
  const signerAddress = await signer.getAddress();

  console.log("\nContract Details:");
  console.log("Contract Address:", bettingContractAddress);
  console.log("Owner Address:", owner);
  console.log("Current Signer:", signerAddress);
  console.log("Is Signer Owner?", owner.toLowerCase() === signerAddress.toLowerCase());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 