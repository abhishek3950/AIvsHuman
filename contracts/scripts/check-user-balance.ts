import { ethers } from "hardhat";

async function main() {
  const tokenAddress = "0x1f8b71dc3b0650bf4b3701B1DD68ddA4af1eC907";
  const userAddress = "0xf07C2dce70EC97ff0bb70A36c4ED0F8F85b22Ab4";

  console.log("Checking user token balance...");
  console.log("Token Address:", tokenAddress);
  console.log("User Address:", userAddress);

  // Get token contract instance
  const tokenContract = await ethers.getContractAt("OverOrUnderToken", tokenAddress);
  
  // Get user balance
  const balance = await tokenContract.balanceOf(userAddress);
  console.log("\nUser Balance:", ethers.formatEther(balance), "tokens");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 