import { ethers } from "hardhat";

async function main() {
  const bettingContractAddress = "0xc38280B96A8810c127F7320a5bCD142dA4C8B5e6";
  const tokenAddress = "0x1f8b71dc3b0650bf4b3701B1DD68ddA4af1eC907";
  const ownerAddress = "0xfdA7F22fB68841AFc8F3dA9a837dD08DE96C18da";
  const fundAmount = ethers.parseEther("1000"); // Fund with 1000 tokens

  console.log("Funding betting contract with tokens...");
  console.log("Betting Contract:", bettingContractAddress);
  console.log("Token Address:", tokenAddress);
  console.log("Owner Address:", ownerAddress);
  console.log("Fund Amount:", ethers.formatEther(fundAmount), "tokens");

  // Get signer from hardhat
  const [signer] = await ethers.getSigners();
  console.log("Using signer:", signer.address);

  // Get token contract instance
  const tokenContract = await ethers.getContractAt("OverOrUnderToken", tokenAddress, signer);
  
  // Transfer tokens to betting contract
  console.log("\nTransferring tokens...");
  const tx = await tokenContract.transfer(bettingContractAddress, fundAmount);
  console.log("Transaction hash:", tx.hash);
  
  // Wait for transaction to be mined
  console.log("Waiting for transaction to be mined...");
  const receipt = await tx.wait();
  console.log("Transaction confirmed in block:", receipt?.blockNumber);

  // Verify new balance
  const balance = await tokenContract.balanceOf(bettingContractAddress);
  console.log("\nNew Betting Contract Balance:", ethers.formatEther(balance), "tokens");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 