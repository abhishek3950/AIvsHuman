import { ethers } from "hardhat";

async function main() {
  // Get the token contract address from environment variable
  const tokenAddress = process.env.TOKEN_CONTRACT_ADDRESS;
  if (!tokenAddress) {
    throw new Error("TOKEN_CONTRACT_ADDRESS not set in environment variables");
  }

  // Get the treasury address (using deployer as treasury for now)
  const [deployer] = await ethers.getSigners();
  const treasuryAddress = deployer.address;

  console.log("Deploying BettingContract...");
  const BettingContract = await ethers.getContractFactory("BettingContract");
  const bettingContract = await BettingContract.deploy(
    tokenAddress,
    "0x0000000000000000000000000000000000000000", // Zero address for initial AI agent
    treasuryAddress
  );
  await bettingContract.waitForDeployment();

  const bettingAddress = await bettingContract.getAddress();
  console.log("BettingContract deployed to:", bettingAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 