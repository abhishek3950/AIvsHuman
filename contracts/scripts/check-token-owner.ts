import { ethers } from "hardhat";

async function main() {
  const tokenAddress = "0x1f8b71dc3b0650bf4b3701B1DD68ddA4af1eC907";

  console.log("Checking token owner and balance...");
  console.log("Token Address:", tokenAddress);

  // Get token contract instance
  const tokenContract = await ethers.getContractAt("OverOrUnderToken", tokenAddress);
  
  // Get token owner
  const owner = await tokenContract.owner();
  console.log("\nToken Owner:", owner);

  // Get owner's balance
  const balance = await tokenContract.balanceOf(owner);
  console.log("Owner Balance:", ethers.formatEther(balance), "tokens");

  // Get token details
  const name = await tokenContract.name();
  const symbol = await tokenContract.symbol();
  const totalSupply = await tokenContract.totalSupply();
  const treasury = await tokenContract.treasury();

  console.log("\nToken Details:");
  console.log("Name:", name);
  console.log("Symbol:", symbol);
  console.log("Total Supply:", ethers.formatEther(totalSupply), "tokens");
  console.log("Treasury:", treasury);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 