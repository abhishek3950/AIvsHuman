import { ethers } from "hardhat";

async function main() {
  // Get the token contract address from environment variable
  const tokenAddress = process.env.TOKEN_ADDRESS;
  if (!tokenAddress) {
    throw new Error("TOKEN_ADDRESS environment variable not set");
  }

  // Get the deployer's address to use as the treasury address
  const [deployer] = await ethers.getSigners();
  const treasuryAddress = await deployer.getAddress();

  console.log("Deploying BettingContractV2...");
  console.log("Token Address:", tokenAddress);
  console.log("Treasury Address:", treasuryAddress);

  // Deploy BettingContractV2
  const BettingContractV2 = await ethers.getContractFactory("BettingContractV2");
  const bettingContract = await BettingContractV2.deploy(
    tokenAddress,
    ethers.ZeroAddress, // Initial AI agent address (zero address)
    treasuryAddress
  );
  await bettingContract.waitForDeployment();

  console.log("BettingContractV2 deployed to:", await bettingContract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 