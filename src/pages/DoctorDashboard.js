import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Table, Alert, Badge, InputGroup, Modal, Row, Col } from 'react-bootstrap';
import { DEPARTMENTS } from '../constants/departments';

function DoctorDashboard({ account, contract }) {
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [departmentAppointments, setDepartmentAppointments] = useState([]);
    const [showMedicalRecordModal, setShowMedicalRecordModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [medicalRecord, setMedicalRecord] = useState({
        diagnosis: '',
        prescription: '',
        notes: '',
        symptoms: '',
        treatment: '',
        followUp: ''
    });
    const [patientRecords, setPatientRecords] = useState([]);

    useEffect(() => {
        if (contract && account) {
            loadDoctorData();
            loadDepartmentAppointments();
        }
    }, [contract, account]);

    const loadDoctorData = async () => {
        try {
            const doctorData = await contract.doctors(account);
            setDoctor({
                name: doctorData.name,
                department: doctorData.department,
                phone: doctorData.phone,
                homeAddress: doctorData.homeAddress,
                isRegistered: doctorData.isRegistered
            });
        } catch (err) {
            console.error("Error loading doctor data:", err);
            setError("Không thể tải thông tin bác sĩ");
        } finally {
            setLoading(false);
        }
    };

    const loadDepartmentAppointments = async () => {
        try {
            const doctorData = await contract.doctors(account);
            const department = doctorData.department;

            // Lấy tất cả các cuộc hẹn của khoa
            const appointments = await contract.getAppointmentsByDepartment(department);

            // Lấy chi tiết cho từng cuộc hẹn
            const appointmentDetails = await Promise.all(
                appointments.map(async (appointmentId) => {
                    const appointment = await contract.appointments(appointmentId);
                    const patient = await contract.patients(appointment.patient);
                    return {
                        id: appointmentId.toString(),
                        patientName: patient.name,
                        patientAddress: appointment.patient,
                        time: new Date(Number(appointment.appointmentTime) * 1000),
                        description: appointment.description,
                        isConfirmed: appointment.isConfirmed,
                        isDone: appointment.isDone,
                        isCanceled: appointment.isCanceled,
                        department: appointment.department
                    };
                })
            );

            // Lọc bỏ các lịch hẹn đã bị hủy
            const activeAppointments = appointmentDetails.filter(
                appointment => !appointment.isCanceled
            );

            setDepartmentAppointments(activeAppointments);
        } catch (err) {
            console.error('Error loading department appointments:', err);
            setError('Error loading appointments: ' + err.message);
        }
    };

    const handleViewPatientRecords = async (patientAddr) => {
        try {
            const records = await contract.getPatientRecords(patientAddr);
            setPatientRecords(records.map(record => ({
                timestamp: Number(record.timestamp),
                doctor: record.doctor,
                diagnosis: record.diagnosis,
                prescription: record.prescription,
                notes: record.notes,
                symptoms: record.symptoms,
                treatment: record.treatment,
                followUp: record.followUp
            })));
        } catch (err) {
            setError('Error loading patient records: ' + err.message);
        }
    };

    const handleAddMedicalRecord = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const tx = await contract.addMedicalRecordAndCompleteAppointment(
                selectedAppointment.patientAddress,
                medicalRecord.diagnosis,
                medicalRecord.prescription,
                medicalRecord.notes,
                medicalRecord.symptoms,
                medicalRecord.treatment,
                medicalRecord.followUp,
                selectedAppointment.id
            );
            await tx.wait();

            setSuccess('Đã thêm hồ sơ bệnh án thành công!');
            setShowMedicalRecordModal(false);

            // Reload data
            loadDepartmentAppointments();
            handleViewPatientRecords(selectedAppointment.patientAddress);

            // Reset form
            setMedicalRecord({
                diagnosis: '',
                prescription: '',
                notes: '',
                symptoms: '',
                treatment: '',
                followUp: ''
            });
        } catch (err) {
            setError('Lỗi khi thêm hồ sơ: ' + err.message);
        }
    };

    const handleConfirmAppointment = async (appointmentId) => {
        try {
            const tx = await contract.confirmAppointment(appointmentId);
            await tx.wait();
            setSuccess('Đã xác nhận lịch hẹn thành công!');
            loadDepartmentAppointments();
        } catch (err) {
            setError('Lỗi khi xác nhận lịch hẹn: ' + err.message);
        }
    };

    const openMedicalRecordModal = (appointment) => {
        setSelectedAppointment(appointment);
        handleViewPatientRecords(appointment.patientAddress);
        setShowMedicalRecordModal(true);
    };

    if (loading) return <div>Loading...</div>;
    if (!doctor) return <div>Doctor not found</div>;
    if (!doctor.isRegistered) return <div>You are not registered as a doctor</div>;

    return (
        <Container>
            <h2 className="mb-4">Trang Quản lý Bác sĩ</h2>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Row>
                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title>Thông tin Bác sĩ</Card.Title>
                            <Card.Text>
                                <strong>Tên:</strong> {doctor?.name}<br />
                                <strong>Khoa:</strong> {doctor?.department}<br />
                                <strong>Số điện thoại:</strong> {doctor?.phone}<br />
                                <strong>Địa chỉ:</strong> {doctor?.homeAddress}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="mb-4">
                <Card.Header>
                    <h3>Danh sách lịch hẹn  {doctor.department}</h3>
                </Card.Header>
                <Card.Body>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Thời gian</th>
                                <th>Bệnh nhân</th>
                                <th>Triệu chứng</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departmentAppointments.map((appointment) => (
                                <tr key={appointment.id}>
                                    <td>{appointment.time.toLocaleString()}</td>
                                    <td>
                                        {appointment.patientName}<br />
                                        <small className="text-muted">{appointment.patientAddress}</small>
                                    </td>
                                    <td>{appointment.description}</td>
                                    <td>
                                        {appointment.isDone ? (
                                            <Badge bg="success">Đã khám</Badge>
                                        ) : appointment.isConfirmed ? (
                                            <Badge bg="primary">Đã xác nhận</Badge>
                                        ) : (
                                            <Badge bg="warning">Chờ xác nhận</Badge>
                                        )}
                                    </td>
                                    <td>
                                        {!appointment.isConfirmed && (
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleConfirmAppointment(appointment.id)}
                                            >
                                                Xác nhận
                                            </Button>
                                        )}
                                        {appointment.isConfirmed && !appointment.isDone && (
                                            <Button
                                                variant="outline-success"
                                                size="sm"
                                                onClick={() => openMedicalRecordModal(appointment)}
                                            >
                                                Thêm hồ sơ
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Modal thêm hồ sơ bệnh án */}
            <Modal
                show={showMedicalRecordModal}
                onHide={() => setShowMedicalRecordModal(false)}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Thêm hồ sơ bệnh án</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedAppointment && (
                        <>
                            <div className="mb-4">
                                <h5>Thông tin bệnh nhân</h5>
                                <p>
                                    <strong>Tên:</strong> {selectedAppointment.patientName}<br />
                                    <strong>Thời gian hẹn:</strong> {selectedAppointment.time.toLocaleString()}<br />
                                    <strong>Triệu chứng:</strong> {selectedAppointment.description}
                                </p>
                            </div>

                            {patientRecords.length > 0 && (
                                <div className="mb-4">
                                    <h5>Lịch sử khám bệnh</h5>
                                    <div className="table-responsive">
                                        <Table striped bordered hover size="sm">
                                            <thead>
                                                <tr>
                                                    <th>Ngày khám</th>
                                                    <th>Triệu chứng</th>
                                                    <th>Chẩn đoán</th>
                                                    <th>Phương pháp điều trị</th>
                                                    <th>Đơn thuốc</th>
                                                    <th>Dặn dò</th>
                                                    <th>Ghi chú</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {patientRecords.map((record, index) => (
                                                    <tr key={index}>
                                                        <td>{new Date(record.timestamp * 1000).toLocaleString()}</td>
                                                        <td>{record.symptoms}</td>
                                                        <td>{record.diagnosis}</td>
                                                        <td>{record.treatment}</td>
                                                        <td>{record.prescription}</td>
                                                        <td>{record.followUp}</td>
                                                        <td>{record.notes}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                </div>
                            )}

                            <Form onSubmit={handleAddMedicalRecord}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Triệu chứng</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={medicalRecord.symptoms}
                                        onChange={(e) => setMedicalRecord(prev => ({
                                            ...prev,
                                            symptoms: e.target.value
                                        }))}
                                        required
                                        placeholder="Nhập triệu chứng của bệnh nhân"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Chẩn đoán</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={medicalRecord.diagnosis}
                                        onChange={(e) => setMedicalRecord(prev => ({
                                            ...prev,
                                            diagnosis: e.target.value
                                        }))}
                                        required
                                        placeholder="Nhập chẩn đoán của bác sĩ"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Phương pháp điều trị</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={medicalRecord.treatment}
                                        onChange={(e) => setMedicalRecord(prev => ({
                                            ...prev,
                                            treatment: e.target.value
                                        }))}
                                        required
                                        placeholder="Nhập phương pháp điều trị"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Đơn thuốc</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={medicalRecord.prescription}
                                        onChange={(e) => setMedicalRecord(prev => ({
                                            ...prev,
                                            prescription: e.target.value
                                        }))}
                                        required
                                        placeholder="Nhập đơn thuốc cho bệnh nhân"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Dặn dò</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={medicalRecord.followUp}
                                        onChange={(e) => setMedicalRecord(prev => ({
                                            ...prev,
                                            followUp: e.target.value
                                        }))}
                                        required
                                        placeholder="Nhập hướng dẫn theo dõi và tái khám"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Ghi chú thêm</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={medicalRecord.notes}
                                        onChange={(e) => setMedicalRecord(prev => ({
                                            ...prev,
                                            notes: e.target.value
                                        }))}
                                        placeholder="Nhập các ghi chú bổ sung (nếu có)"
                                    />
                                </Form.Group>

                                <Button type="submit" variant="primary">
                                    Lưu hồ sơ
                                </Button>
                            </Form>
                        </>
                    )}
                </Modal.Body>
            </Modal>
        </Container>
    );
}

export default DoctorDashboard; 