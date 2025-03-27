import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Alert, Badge, Nav } from 'react-bootstrap';
import { DEPARTMENTS } from '../constants/departments';
import AppointmentList from '../components/AppointmentList';

function PatientDashboard({ account, contract }) {
    const [patient, setPatient] = useState(null);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [appointmentForm, setAppointmentForm] = useState({
        appointmentTime: '',
        description: ''
    });
    const appointmentListRef = useRef();

    useEffect(() => {
        if (contract && account) {
            loadPatientData();
            loadAllDoctors();
        }
    }, [contract, account]);

    const loadPatientData = async () => {
        try {
            const patientData = await contract.patients(account);
            setPatient({
                name: patientData.name,
                dateOfBirth: Number(patientData.dateOfBirth),
                bloodType: patientData.bloodType,
                phone: patientData.phone,
                homeAddress: patientData.homeAddress
            });

            const records = await contract.getPatientRecords(account);
            // Lấy thông tin chi tiết của bác sĩ cho mỗi record
            const recordsWithDoctorInfo = await Promise.all(
                records.map(async record => {
                    const doctorData = await contract.doctors(record.doctor);
                    return {
                        timestamp: Number(record.timestamp),
                        diagnosis: record.diagnosis,
                        prescription: record.prescription,
                        notes: record.notes,
                        doctor: {
                            address: record.doctor,
                            name: doctorData.name,
                            department: doctorData.department
                        }
                    };
                })
            );
            setRecords(recordsWithDoctorInfo);

        } catch (err) {
            console.error("Error:", err);
            setError('Error loading patient data: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadAllDoctors = async () => {
        try {
            const doctorAddresses = await contract.getAllDoctors();
            const doctorDetails = await Promise.all(
                doctorAddresses.map(async (address) => {
                    const doctor = await contract.doctors(address);
                    return {
                        address: address,
                        name: doctor.name,
                        department: doctor.department,
                        isRegistered: doctor.isRegistered
                    };
                })
            );
            setDoctors(doctorDetails);
        } catch (err) {
            console.error("Error loading doctors:", err);
        }
    };

    const handleCreateAppointment = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const timestamp = Math.floor(new Date(appointmentForm.appointmentTime).getTime() / 1000);

            const tx = await contract.createAppointment(
                selectedDoctor.address,
                timestamp,
                appointmentForm.description
            );
            await tx.wait();

            setSuccess('Đặt lịch hẹn thành công!');
            setAppointmentForm({ appointmentTime: '', description: '' });
            setSelectedDoctor(null);

            // Reload appointments after creating a new one
            if (appointmentListRef.current) {
                appointmentListRef.current.loadAppointments();
            }
        } catch (err) {
            setError('Lỗi khi đặt lịch: ' + err.message);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAppointmentForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Tính toán thời gian tối thiểu cho lịch hẹn (24 giờ từ hiện tại)
    const minDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16);

    const filteredDoctors = selectedDepartment
        ? doctors.filter(doctor => doctor.department === selectedDepartment)
        : doctors;

    if (loading) return <div>Loading...</div>;
    if (!patient) return <div>Patient not found</div>;

    return (
        <Container>
            <h2 className="mb-4">Patient Dashboard</h2>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Row>
                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title>Personal Information</Card.Title>
                            <Card.Text>
                                <strong>Name:</strong> {patient.name}<br />
                                <strong>Date of Birth:</strong> {new Date(patient.dateOfBirth * 1000).toLocaleDateString()}<br />
                                <strong>Blood Type:</strong> {patient.bloodType}<br />
                                <strong>Phone:</strong> {patient.phone}<br />
                                <strong>Address:</strong> {patient.homeAddress}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="mb-4">
                <Card.Header>
                    <h3>Đặt lịch khám</h3>
                </Card.Header>
                <Card.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Chọn Khoa</Form.Label>
                        <Form.Select
                            value={selectedDepartment}
                            onChange={(e) => {
                                setSelectedDepartment(e.target.value);
                                setSelectedDoctor(null);
                            }}
                        >
                            <option value="">Tất cả khoa</option>
                            {DEPARTMENTS.map((dept, index) => (
                                <option key={index} value={dept}>
                                    {dept}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Tên bác sĩ</th>
                                <th>Khoa</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDoctors.map((doctor) => (
                                <tr key={doctor.address}>
                                    <td>{doctor.name}</td>
                                    <td>{doctor.department}</td>
                                    <td>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => setSelectedDoctor(doctor)}
                                        >
                                            Chọn bác sĩ
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    {selectedDoctor && (
                        <Card className="mt-3">
                            <Card.Body>
                                <Card.Title>Đặt lịch với bác sĩ {selectedDoctor.name}</Card.Title>
                                <Form onSubmit={handleCreateAppointment}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Thời gian hẹn</Form.Label>
                                        <Form.Control
                                            type="datetime-local"
                                            name="appointmentTime"
                                            value={appointmentForm.appointmentTime}
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
                                            value={appointmentForm.description}
                                            onChange={handleChange}
                                            placeholder="Mô tả ngắn gọn về tình trạng bệnh..."
                                            required
                                        />
                                    </Form.Group>

                                    <Button type="submit" variant="primary">
                                        Đặt lịch hẹn
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    )}
                </Card.Body>
            </Card>

            <Card>
                <Card.Body>
                    <Card.Title>Hồ sơ bệnh án</Card.Title>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Ngày khám</th>
                                <th>Bác sĩ</th>
                                <th>Khoa</th>
                                <th>Chẩn đoán</th>
                                <th>Đơn thuốc</th>
                                <th>Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((record, index) => (
                                <tr key={index}>
                                    <td>{new Date(record.timestamp * 1000).toLocaleDateString()}</td>
                                    <td>
                                        {record.doctor.name}<br />
                                        <small className="text-muted">{record.doctor.address}</small>
                                    </td>
                                    <td>{record.doctor.department}</td>
                                    <td>{record.diagnosis}</td>
                                    <td>{record.prescription}</td>
                                    <td>{record.notes}</td>
                                </tr>
                            ))}
                            {records.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center">
                                        Chưa có hồ sơ bệnh án
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <AppointmentList
                ref={appointmentListRef}
                contract={contract}
                isDoctor={false}
            />
        </Container>
    );
}

export default PatientDashboard; 