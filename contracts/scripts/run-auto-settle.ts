import { autoSettleAndCreate } from "./auto-settle-and-create";

async function main() {
  console.log("Starting auto-settle process...");
  console.log("This will check and settle markets every minute.");
  console.log("Press Ctrl+C to stop.");

  // Run immediately
  await autoSettleAndCreate();

  // Then run every minute
  setInterval(async () => {
    try {
      await autoSettleAndCreate();
    } catch (error) {
      console.error("Error in auto-settle process:", error);
    }
  }, 60000); // 60000 ms = 1 minute
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}); 