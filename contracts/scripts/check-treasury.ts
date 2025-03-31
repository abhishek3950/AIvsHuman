import { ethers } from "hardhat";

async function main() {
  const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS;
  if (!TREASURY_ADDRESS) {
    throw new Error("TREASURY_ADDRESS not set in environment");
  }

  const tokenContract = await ethers.getContractAt(
    "Token",
    process.env.TOKEN_ADDRESS as string
  );

  const treasuryBalance = await tokenContract.balanceOf(TREASURY_ADDRESS);
  console.log("Treasury Balance:", ethers.formatEther(treasuryBalance), "tokens");

  // Get treasury deposit events
  const filter = tokenContract.filters.Transfer(null, TREASURY_ADDRESS);
  const events = await tokenContract.queryFilter(filter);
  
  console.log("\nTreasury Deposits:");
  for (const event of events) {
    if (event instanceof ethers.EventLog) {
      const amount = event.args[2];
      const from = event.args[0];
      const blockNumber = event.blockNumber;
      console.log(`- ${ethers.formatEther(amount)} tokens from ${from} at block ${blockNumber}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 