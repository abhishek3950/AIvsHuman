import { ethers } from "hardhat";

async function main() {
  // Get contract addresses from environment variables
  const tokenAddress = process.env.TOKEN_CONTRACT_ADDRESS;
  const faucetAddress = process.env.FAUCET_CONTRACT_ADDRESS;
  
  if (!tokenAddress || !faucetAddress) {
    throw new Error("TOKEN_CONTRACT_ADDRESS or FAUCET_CONTRACT_ADDRESS not set in environment variables");
  }

  // Get the token contract
  const Token = await ethers.getContractFactory("BettingToken");
  const token = Token.attach(tokenAddress);

  // Fund amount (1 million tokens)
  const fundAmount = ethers.parseEther("1000000");

  console.log("Funding faucet with tokens...");
  const tx = await token.transfer(faucetAddress, fundAmount);
  await tx.wait();

  const faucetBalance = await token.balanceOf(faucetAddress);
  console.log("Faucet balance:", ethers.formatEther(faucetBalance), "tokens");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 