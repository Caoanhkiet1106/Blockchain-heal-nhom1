import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Login({ contract }) {
    const [role, setRole] = useState('patient'); // 'patient' hoặc 'doctor'
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (role === 'patient') {
                const patientData = await contract.patients(window.ethereum.selectedAddress);
                if (!patientData.isRegistered) {
                    setError('Patient not registered. Please register first.');
                    return;
                }
                navigate('/patient-dashboard');
            } else {
                const doctorData = await contract.doctors(window.ethereum.selectedAddress);
                if (!doctorData.isRegistered) {
                    setError('Doctor not registered. Please contact admin.');
                    return;
                }
                navigate('/doctor-dashboard');
            }
        } catch (err) {
            setError('Error logging in: ' + err.message);
        }
    };

    return (
        <Container className="mt-5">
            <Card className="mx-auto" style={{ maxWidth: '500px' }}>
                <Card.Header>
                    <h3>Login</h3>
                </Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleLogin}>
                        <Form.Group className="mb-3">
                            <Form.Label>Login as</Form.Label>
                            <Form.Select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="patient">Patient</option>
                                <option value="doctor">Doctor</option>
                            </Form.Select>
                        </Form.Group>

                        <div className="d-grid gap-2">
                            <Button variant="primary" type="submit">
                                Login with MetaMask
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default Login; 