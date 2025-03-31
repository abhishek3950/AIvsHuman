import { ethers } from "hardhat";
import { config } from "dotenv";

config();

async function main() {
  const tokenAddress = process.env.TOKEN_CONTRACT_ADDRESS;
  if (!tokenAddress) {
    throw new Error("TOKEN_CONTRACT_ADDRESS not set in environment variables");
  }

  const bettingContractAddress = process.env.BETTING_CONTRACT_ADDRESS;
  if (!bettingContractAddress) {
    throw new Error("BETTING_CONTRACT_ADDRESS not set in environment variables");
  }

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY not set in environment variables");
  }

  console.log("Approving tokens...");
  console.log("Token Address:", tokenAddress);
  console.log("Betting Contract:", bettingContractAddress);

  // Create wallet with private key
  const wallet = new ethers.Wallet(privateKey);
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const signer = wallet.connect(provider);

  // Get token contract instance
  const tokenContract = await ethers.getContractAt("OverOrUnderToken", tokenAddress, signer);
  
  // Approve tokens
  const amount = ethers.parseEther("1000"); // 1000 tokens
  console.log("\nApproving amount:", ethers.formatEther(amount), "tokens");
  
  const tx = await tokenContract.approve(bettingContractAddress, amount);
  console.log("Transaction hash:", tx.hash);
  
  // Wait for transaction to be mined
  console.log("Waiting for transaction to be mined...");
  const receipt = await tx.wait();
  console.log("Transaction confirmed in block:", receipt?.blockNumber);

  // Verify allowance
  const allowance = await tokenContract.allowance(await signer.getAddress(), bettingContractAddress);
  console.log("\nAllowance:", ethers.formatEther(allowance), "tokens");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 