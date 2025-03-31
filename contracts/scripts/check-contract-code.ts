import { ethers } from "hardhat";

async function main() {
  const address = "0xfdA7F22fB68841AFc8F3dA9a837dD08DE96C18da";
  
  console.log("Checking contract code at address:", address);

  // Get the provider
  const provider = await ethers.provider;
  
  // Get the contract code
  const code = await provider.getCode(address);
  console.log("\nContract Code Length:", code.length);
  console.log("Is Contract:", code !== "0x");
  
  if (code === "0x") {
    console.log("No contract code found at this address!");
    return;
  }

  // Try to get the contract factory
  try {
    const aiAgent = await ethers.getContractAt("AIAgent", address);
    console.log("\nContract is an AIAgent");
  } catch (error) {
    console.log("\nContract is not an AIAgent");
  }

  try {
    const bettingContract = await ethers.getContractAt("BettingContract", address);
    console.log("Contract is a BettingContract");
  } catch (error) {
    console.log("Contract is not a BettingContract");
  }

  // Get the first few bytes of the code to identify the contract
  const codeHash = ethers.keccak256(code);
  console.log("\nContract Code Hash:", codeHash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 