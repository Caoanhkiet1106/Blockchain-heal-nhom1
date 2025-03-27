import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import HealthRecord from '../artifacts/contracts/HealthRecord.sol/HealthRecord.json';

const ContractContext = createContext();

export function ContractProvider({ children }) {
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState('');

    useEffect(() => {
        const initContract = async () => {
            if (typeof window.ethereum !== 'undefined') {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    setAccount(accounts[0]);

                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const signer = await provider.getSigner();

                    const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
                    if (!contractAddress) {
                        throw new Error('Contract address not found in environment variables');
                    }

                    const healthRecord = new ethers.Contract(
                        contractAddress,
                        HealthRecord.abi,
                        signer
                    );
                    setContract(healthRecord);
                } catch (error) {
                    console.error("Error initializing contract:", error);
                }
            }
        };

        initContract();
    }, []);

    return (
        <ContractContext.Provider value={{ contract, account }}>
            {children}
        </ContractContext.Provider>
    );
}

export function useContract() {
    return useContext(ContractContext);
} 