const hre = require("hardhat");
require('dotenv').config();

async function main() {
    // Get the contract address from .env
    const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
    if (!contractAddress) {
        throw new Error("Contract address not found in .env file");
    }

    // Get the contract factory and signer
    const [owner] = await hre.ethers.getSigners();
    const HealthRecord = await hre.ethers.getContractFactory("HealthRecord");
    const contract = await HealthRecord.attach(contractAddress);

    // Doctor details - replace with actual doctor address
    const doctorAddress = "REPLACE_WITH_DOCTOR_ADDRESS"; // Replace this with your doctor's address
    const doctorName = "Dr. John Doe";
    const specialization = "General Medicine";

    console.log("Registering doctor with address:", doctorAddress);
    console.log("Name:", doctorName);
    console.log("Specialization:", specialization);

    try {
        // Register the doctor
        const tx = await contract.connect(owner).registerDoctor(doctorAddress, doctorName, specialization);
        console.log("Transaction sent. Waiting for confirmation...");

        // Wait for the transaction to be mined
        const receipt = await tx.wait();

        console.log("Doctor registered successfully!");
        console.log("Transaction hash:", receipt.hash);
    } catch (error) {
        console.error("Error registering doctor:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 