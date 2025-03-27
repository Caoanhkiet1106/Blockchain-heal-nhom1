const hre = require("hardhat");

async function main() {
    // Get the contract factory
    const HealthRecord = await hre.ethers.getContractFactory("HealthRecord");

    // Deploy the contract
    console.log("Deploying HealthRecord contract...");
    const healthRecord = await HealthRecord.deploy();

    // Wait for deployment to finish
    await healthRecord.waitForDeployment();

    // Get the contract address
    const address = await healthRecord.getAddress();
    console.log("HealthRecord contract deployed to:", address);

    // Log the transaction hash
    console.log("Transaction hash:", healthRecord.deploymentTransaction().hash);
}

// Execute deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error deploying contract:", error);
        process.exit(1);
    }); 