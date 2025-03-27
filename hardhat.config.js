require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.19",
    networks: {
        sepolia: {
            url: process.env.SEPOLIA_URL || "",
            accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
        },
        localhost: { 
            url: "http://127.0.0.1:7545",
            chainId: 1337,
            accounts: ["0x521ba8bc8ed4291ab9b1efb5ae20cc395ab4cc0df8177d85a8d4a3ccc68f5d47"]
        }
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./src/artifacts"
    }
}; 