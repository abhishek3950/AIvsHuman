import { ethers } from "hardhat";
import { OverOrUnderToken } from "../typechain-types";

async function main() {
  const tokenAddress = "0x1f8b71dc3b0650bf4b3701B1DD68ddA4af1eC907";
  const bettingAddress = "0x12348Bb035e8F259C455006fA7caB9Ea4879e7Fe";
  const approvalAmount = ethers.parseEther("1000"); // Approve 1000 tokens
  
  console.log("Approving tokens...");
  const Token = await ethers.getContractFactory("OverOrUnderToken");
  const token = Token.attach(tokenAddress) as OverOrUnderToken;
  
  const tx = await token.approve(bettingAddress, approvalAmount);
  await tx.wait();
  
  // Check allowance
  const [signer] = await ethers.getSigners();
  const allowance = await token.allowance(signer.address, bettingAddress);
  console.log("\nApproval successful!");
  console.log("Allowance:", ethers.formatEther(allowance), "tokens");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 