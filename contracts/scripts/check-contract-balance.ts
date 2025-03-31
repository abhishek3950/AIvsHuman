import { ethers } from "hardhat";

async function main() {
  const bettingContractAddress = "0xc38280B96A8810c127F7320a5bCD142dA4C8B5e6";
  const tokenAddress = "0x1f8b71dc3b0650bf4b3701B1DD68ddA4af1eC907";

  console.log("Checking betting contract token balance...");
  console.log("Betting Contract:", bettingContractAddress);
  console.log("Token Address:", tokenAddress);

  // Get token contract instance
  const tokenContract = await ethers.getContractAt("OverOrUnderToken", tokenAddress);
  
  // Get betting contract balance
  const balance = await tokenContract.balanceOf(bettingContractAddress);
  console.log("\nBetting Contract Balance:", ethers.formatEther(balance), "tokens");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 