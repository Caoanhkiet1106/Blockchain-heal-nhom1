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
            accounts: ["0x4c246b4e8bd5b5b242f1c957e493e8bd848eeda6c4f4b6b622f49edb90b9125b"]
        }
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./src/artifacts"
    }
}; 