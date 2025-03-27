import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { DEPARTMENTS } from '../constants/departments';

function AppointmentForm({ contract }) {
    const [formData, setFormData] = useState({
        department: '',
        doctorAddress: '',
        appointmentTime: '',
        description: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (formData.department) {
            loadDoctorsByDepartment();
        }
    }, [formData.department]);

    const loadDoctorsByDepartment = async () => {
        setLoading(true);
        try {
            const allDoctors = await contract.getAllDoctors();
            const doctorDetails = await Promise.all(
                allDoctors.map(async (address) => {
                    const doctor = await contract.doctors(address);
                    return {
                        address: address,
                        name: doctor.name,
                        specialization: doctor.specialization,
                        department: doctor.department
                    };
                })
            );

            // Lọc bác sĩ theo khoa
            const filteredDoctors = doctorDetails.filter(
                doctor => doctor.department === formData.department
            );
            setDoctors(filteredDoctors);
        } catch (err) {
            setError('Error loading doctors: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const timestamp = Math.floor(new Date(formData.appointmentTime).getTime() / 1000);

            const tx = await contract.createAppointment(
                formData.doctorAddress,
                timestamp,
                formData.description
            );
            await tx.wait();

            setSuccess('Appointment scheduled successfully!');
            setFormData({
                department: '',
                doctorAddress: '',
                appointmentTime: '',
                description: ''
            });
        } catch (err) {
            setError('Error scheduling appointment: ' + err.message);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Tính toán thời gian tối thiểu cho lịch hẹn (24 giờ từ hiện tại)
    const minDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16);

    return (
        <Form onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form.Group className="mb-3">
                <Form.Label>Chọn Khoa</Form.Label>
                <Form.Select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                >
                    <option value="">Chọn khoa...</option>
                    {DEPARTMENTS.map((dept, index) => (
                        <option key={index} value={dept}>
                            {dept}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Chọn Bác sĩ</Form.Label>
                <Form.Select
                    name="doctorAddress"
                    value={formData.doctorAddress}
                    onChange={handleChange}
                    required
                    disabled={!formData.department || loading}
                >
                    <option value="">Chọn bác sĩ...</option>
                    {doctors.map((doctor) => (
                        <option key={doctor.address} value={doctor.address}>
                            {doctor.name} - {doctor.specialization}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Thời gian hẹn</Form.Label>
                <Form.Control
                    type="datetime-local"
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleChange}
                    min={minDateTime}
                    required
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Mô tả triệu chứng</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Mô tả ngắn gọn về tình trạng bệnh..."
                    required
                />
            </Form.Group>

            <Button type="submit" variant="primary">
                Đặt lịch hẹn
            </Button>
        </Form>
    );
}

export default AppointmentForm; 