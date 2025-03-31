import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Get contract addresses from environment variables
  const USDC_ADDRESS = process.env.USDC_ADDRESS;
  const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS;
  const USDC_WALLET_ADDRESS = process.env.USDC_WALLET_ADDRESS;

  if (!USDC_ADDRESS || !TREASURY_ADDRESS || !USDC_WALLET_ADDRESS) {
    throw new Error("Required environment variables not set");
  }

  // Deploy OverOrUnderToken
  const OverOrUnderToken = await ethers.getContractFactory("OverOrUnderToken");
  const token = await OverOrUnderToken.deploy(
    USDC_ADDRESS,
    TREASURY_ADDRESS,
    USDC_WALLET_ADDRESS
  );

  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  console.log("OverOrUnderToken deployed to:", tokenAddress);
  console.log("Using USDC:", USDC_ADDRESS);
  console.log("Using Treasury:", TREASURY_ADDRESS);
  console.log("Using USDC Wallet:", USDC_WALLET_ADDRESS);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 