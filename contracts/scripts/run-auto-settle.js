const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function runSettlementCheck() {
  try {
    console.log('Running settlement check...');
    await execAsync('npx hardhat run scripts/auto-settle-market.ts --network baseSepolia');
    console.log('Settlement check completed');
  } catch (error) {
    console.error('Error running settlement check:', error);
  }
}

// Run immediately
runSettlementCheck();

// Then run every minute
setInterval(runSettlementCheck, 60000); 