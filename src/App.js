import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, Navbar, Nav } from 'react-bootstrap';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import Register from './pages/Register';
import RegisterDoctor from './pages/RegisterDoctor';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import PatientList from './pages/PatientList';
import { ethers } from 'ethers';
import HealthRecord from './artifacts/contracts/HealthRecord.sol/HealthRecord.json';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [isDoctor, setIsDoctor] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const init = async () => {
        try {
            if (typeof window.ethereum !== 'undefined') {
                // Get the provider and signer
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setAccount(accounts[0]);

                // Get the contract instance
                const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
                const healthRecord = new ethers.Contract(
                    contractAddress,
                    HealthRecord.abi,
                    signer
                );
                setContract(healthRecord);

                // Check if user is a doctor
                try {
                    const doctorData = await healthRecord.doctors(accounts[0]);
                    setIsDoctor(doctorData.isRegistered);
                } catch (err) {
                    console.log("User is not a doctor");
                    setIsDoctor(false);
                }
            }
        } catch (err) {
            setError('Error initializing app: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        init();

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                setAccount(accounts[0]);
                init();
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', init);
                window.ethereum.removeListener('chainChanged', () => {
                    window.location.reload();
                });
            }
        };
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <Router>
            <div className="App">
                <Navigation account={account} isDoctor={isDoctor} />
                <Container className="mt-4">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login contract={contract} />} />
                        <Route path="/register" element={<Register contract={contract} account={account} />} />
                        <Route path="/patient-dashboard" element={<PatientDashboard account={account} contract={contract} />} />
                        <Route path="/doctor-dashboard" element={<DoctorDashboard account={account} contract={contract} />} />
                        <Route path="/admin" element={<AdminDashboard contract={contract} />} />
                        <Route path="/admin/patients" element={<PatientList contract={contract} />} />
                    </Routes>
                </Container>
            </div>
        </Router>
    );
}

export default App; 