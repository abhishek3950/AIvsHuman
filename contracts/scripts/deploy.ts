import { ethers } from "hardhat";
import { config } from "dotenv";
import * as fs from "fs";
import * as path from "path";

config();

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY not set in environment variables");
  }

  console.log("Deploying contracts...");

  // Create wallet with private key
  const wallet = new ethers.Wallet(privateKey);
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const signer = wallet.connect(provider);

  // Deploy OverOrUnderToken
  console.log("\nDeploying OverOrUnderToken...");
  const tokenContract = await ethers.deployContract("OverOrUnderToken");
  await tokenContract.waitForDeployment();
  console.log("OverOrUnderToken deployed to:", await tokenContract.getAddress());

  // Deploy BettingContract
  console.log("\nDeploying BettingContract...");
  const bettingContract = await ethers.deployContract("BettingContract", [
    await tokenContract.getAddress(),
    process.env.USDC_ADDRESS,
  ]);
  await bettingContract.waitForDeployment();
  console.log("BettingContract deployed to:", await bettingContract.getAddress());

  // Deploy Faucet
  console.log("\nDeploying Faucet...");
  const faucetContract = await ethers.deployContract("Faucet", [
    await tokenContract.getAddress(),
  ]);
  await faucetContract.waitForDeployment();
  console.log("Faucet deployed to:", await faucetContract.getAddress());

  // Fund contracts with initial tokens
  console.log("\nFunding contracts with initial tokens...");
  const initialSupply = ethers.parseEther("1000000"); // 1M tokens
  await tokenContract.transfer(await bettingContract.getAddress(), initialSupply);
  await tokenContract.transfer(await faucetContract.getAddress(), initialSupply);
  console.log("Contracts funded with initial tokens");

  // Save deployment info
  const deploymentInfo = {
    tokenContract: await tokenContract.getAddress(),
    bettingContract: await bettingContract.getAddress(),
    faucetContract: await faucetContract.getAddress(),
    deployer: await signer.getAddress(),
  };

  fs.writeFileSync(
    path.join(__dirname, "../deployment.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\nDeployment info saved to deployment.json");

  // Update .env file
  const envPath = path.join(__dirname, "../.env");
  let envContent = fs.readFileSync(envPath, "utf8");
  envContent = envContent.replace(
    /TOKEN_CONTRACT_ADDRESS=.*/,
    `TOKEN_CONTRACT_ADDRESS=${deploymentInfo.tokenContract}`
  );
  envContent = envContent.replace(
    /BETTING_CONTRACT_ADDRESS=.*/,
    `BETTING_CONTRACT_ADDRESS=${deploymentInfo.bettingContract}`
  );
  envContent = envContent.replace(
    /FAUCET_CONTRACT_ADDRESS=.*/,
    `FAUCET_CONTRACT_ADDRESS=${deploymentInfo.faucetContract}`
  );
  fs.writeFileSync(envPath, envContent);
  console.log("Environment variables updated in .env");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 