import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Register({ account, contract }) {
    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        bloodType: '',
        phone: '',
        homeAddress: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const tx = await contract.registerPatient(
                formData.name,
                formData.phone,
                formData.homeAddress,
                Math.floor(new Date(formData.dob).getTime() / 1000),
                formData.bloodType
            );
            await tx.wait();
            setSuccess('Đăng ký thành công!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError('Lỗi đăng ký: ' + err.message);
        }
    };

    return (
        <Container className="mt-4">
            <Card>
                <Card.Body>
                    <Card.Title className="text-center mb-4">
                        Đăng Ký Tài Khoản Bệnh Nhân
                    </Card.Title>

                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Họ và Tên</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Nhập họ và tên"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Ngày Sinh</Form.Label>
                            <Form.Control
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Nhóm Máu</Form.Label>
                            <Form.Select
                                name="bloodType"
                                value={formData.bloodType}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Chọn nhóm máu</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Số Điện Thoại</Form.Label>
                            <Form.Control
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                placeholder="Nhập số điện thoại"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Địa Chỉ</Form.Label>
                            <Form.Control
                                type="text"
                                name="homeAddress"
                                value={formData.homeAddress}
                                onChange={handleChange}
                                required
                                placeholder="Nhập địa chỉ"
                            />
                        </Form.Group>

                        <div className="d-grid gap-2">
                            <Button variant="primary" type="submit">
                                Đăng Ký
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default Register; 