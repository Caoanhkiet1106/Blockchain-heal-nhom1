import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Table, Button, Badge, Alert } from 'react-bootstrap';

const AppointmentList = forwardRef(({ contract, isDoctor }, ref) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadAppointments = async () => {
        try {
            const appointmentIds = isDoctor
                ? await contract.getDoctorAppointments()
                : await contract.getPatientAppointments();

            const appointmentDetails = await Promise.all(
                appointmentIds.map(async (id) => {
                    const appointment = await contract.appointments(id);
                    const doctor = await contract.doctors(appointment.doctor);
                    const patient = await contract.patients(appointment.patient);

                    // Kiểm tra xem bác sĩ có tồn tại hay không
                    const doctorName = doctor.isRegistered ? doctor.name : "Bác sĩ hiện đang bận";
                    const department = doctor.isRegistered ? doctor.department : "Không khả dụng";

                    return {
                        id: id.toString(),
                        patientName: patient.name || appointment.patient,
                        patientAddress: appointment.patient,
                        doctorName: doctorName,
                        doctorAddress: appointment.doctor,
                        department: department,
                        time: Number(appointment.appointmentTime),
                        description: appointment.description,
                        isConfirmed: appointment.isConfirmed,
                        isDone: appointment.isDone,
                        isCanceled: appointment.isCanceled
                    };
                })
            );

            setAppointments(appointmentDetails);
        } catch (err) {
            console.error("Error loading appointments:", err);
            setError('Lỗi khi tải danh sách lịch hẹn');
        } finally {
            setLoading(false);
        }
    };

    useImperativeHandle(ref, () => ({
        loadAppointments
    }));

    useEffect(() => {
        if (contract) {
            loadAppointments();
        }
    }, [contract]);

    const handleConfirm = async (appointmentId) => {
        try {
            setError('');
            setSuccess('');
            const tx = await contract.confirmAppointment(appointmentId);
            await tx.wait();
            setSuccess('Đã xác nhận lịch hẹn thành công');
            loadAppointments();
        } catch (error) {
            console.error("Error confirming appointment:", error);
            setError('Lỗi khi xác nhận lịch hẹn: ' + error.message);
        }
    };

    const handleComplete = async (appointmentId) => {
        try {
            setError('');
            setSuccess('');
            const tx = await contract.completeAppointment(appointmentId);
            await tx.wait();
            setSuccess('Đã hoàn thành lịch hẹn');
            loadAppointments();
        } catch (error) {
            console.error("Error completing appointment:", error);
            setError('Lỗi khi hoàn thành lịch hẹn: ' + error.message);
        }
    };

    const handleCancelAppointment = async (appointmentId) => {
        try {
            setError('');
            setSuccess('');

            const tx = await contract.cancelAppointment(appointmentId);
            await tx.wait();

            setSuccess('Đã hủy lịch hẹn thành công');
            loadAppointments();
        } catch (err) {
            console.error("Error canceling appointment:", err);
            setError('Lỗi khi hủy lịch hẹn: ' + err.message);
        }
    };

    const getStatusBadge = (appointment) => {
        if (appointment.isCanceled) {
            return <Badge bg="danger">Đã hủy</Badge>;
        } else if (appointment.isDone) {
            return <Badge bg="success">Đã khám</Badge>;
        } else if (appointment.isConfirmed) {
            return <Badge bg="primary">Đã xác nhận</Badge>;
        } else {
            return <Badge bg="warning">Chờ xác nhận</Badge>;
        }
    };

    const canCancel = (appointment) => {
        const appointmentTime = new Date(appointment.time * 1000);
        const now = new Date();
        return !appointment.isDone &&
            !appointment.isCanceled &&
            appointmentTime > now;
    };

    if (loading) return <div>Đang tải...</div>;

    return (
        <div className="mt-4">
            <h3>Danh sách lịch hẹn</h3>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Thời gian</th>
                        {isDoctor ? <th>Bệnh nhân</th> : <th>Bác sĩ</th>}
                        <th>Khoa</th>
                        <th>Triệu chứng</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.map((appointment) => (
                        <tr key={appointment.id}>
                            <td>{new Date(appointment.time * 1000).toLocaleString()}</td>
                            <td>
                                {isDoctor ? (
                                    <>
                                        {appointment.patientName}<br />
                                        <small className="text-muted">{appointment.patientAddress}</small>
                                    </>
                                ) : (
                                    appointment.doctorName === "Bác sĩ hiện đang bận" ? (
                                        <span className="text-danger">Bác sĩ hiện đang bận, mong a/c hủy lịch hẹn và đặt lại lịch khám </span>
                                    ) : (
                                        <>
                                            {appointment.doctorName}<br />
                                            <small className="text-muted">{appointment.doctorAddress}</small>
                                        </>
                                    )
                                )}
                            </td>
                            <td>{appointment.department}</td>
                            <td>{appointment.description}</td>
                            <td>{getStatusBadge(appointment)}</td>
                            <td>
                                {isDoctor ? (
                                    <>
                                        {!appointment.isConfirmed && !appointment.isCanceled && (
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleConfirm(appointment.id)}
                                            >
                                                Xác nhận
                                            </Button>
                                        )}
                                        {appointment.isConfirmed && !appointment.isDone && !appointment.isCanceled && (
                                            <Button
                                                variant="outline-success"
                                                size="sm"
                                                className="me-2"
                                                onClick={() => handleComplete(appointment.id)}
                                            >
                                                Hoàn thành
                                            </Button>
                                        )}
                                    </>
                                ) : null}
                                {canCancel(appointment) && (
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleCancelAppointment(appointment.id)}
                                    >
                                        Hủy lịch hẹn
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                    {appointments.length === 0 && (
                        <tr>
                            <td colSpan="6" className="text-center">
                                Chưa có lịch hẹn nào
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </div>
    );
});

export default AppointmentList; 