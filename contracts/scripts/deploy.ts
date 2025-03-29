import { ethers } from "hardhat";
import { config } from "dotenv";

config();

async function main() {
  // Deploy token contract
  const OverOrUnderToken = await ethers.getContractFactory("OverOrUnderToken");
  const token = await OverOrUnderToken.deploy(
    process.env.USDC_ADDRESS,
    process.env.TREASURY_ADDRESS,
    process.env.USDC_WALLET_ADDRESS
  );
  await token.waitForDeployment();
  console.log("Token deployed to:", await token.getAddress());

  // Deploy betting contract
  const BettingContract = await ethers.getContractFactory("BettingContract");
  const betting = await BettingContract.deploy(
    await token.getAddress(),
    process.env.AI_AGENT_ADDRESS,
    process.env.TREASURY_ADDRESS
  );
  await betting.waitForDeployment();
  console.log("Betting contract deployed to:", await betting.getAddress());

  // Transfer initial tokens to betting contract
  const initialSupply = ethers.parseEther("100000000000"); // 100B tokens
  await token.transfer(await betting.getAddress(), initialSupply);
  console.log("Transferred initial tokens to betting contract");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 