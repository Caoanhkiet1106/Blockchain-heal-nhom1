import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';

function RegisterDoctor({ contract }) {
    const [formData, setFormData] = useState({
        address: '',
        name: '',
        specialization: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!contract) {
            setError('Contract not initialized');
            return;
        }

        try {
            const tx = await contract.registerDoctor(
                formData.address,
                formData.name,
                formData.specialization
            );

            setSuccess('Processing transaction...');
            await tx.wait();
            setSuccess('Doctor registered successfully!');

            // Clear form
            setFormData({
                address: '',
                name: '',
                specialization: ''
            });
        } catch (err) {
            setError('Error registering doctor: ' + err.message);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <Container className="py-5">
            <h2 className="mb-4">Register New Doctor</h2>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Doctor's Ethereum Address</Form.Label>
                    <Form.Control
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter doctor's Ethereum address"
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Doctor's Name</Form.Label>
                    <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter doctor's name"
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Specialization</Form.Label>
                    <Form.Control
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        placeholder="Enter doctor's specialization"
                        required
                    />
                </Form.Group>

                <Button variant="primary" type="submit">
                    Register Doctor
                </Button>
            </Form>
        </Container>
    );
}

export default RegisterDoctor; 