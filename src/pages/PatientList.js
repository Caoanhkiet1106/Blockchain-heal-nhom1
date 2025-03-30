import React, { useState, useEffect } from 'react';
import { Container, Table, Alert } from 'react-bootstrap';

function PatientList({ contract }) {
    const [patients, setPatients] = useState([]);
    const [error, setError] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const owner = await contract.owner(); // Lấy địa chỉ admin từ hợp đồng
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setIsAdmin(owner.toLowerCase() === accounts[0].toLowerCase()); // Kiểm tra quyền admin
            } catch (err) {
                console.error("Lỗi khi kiểm tra quyền admin:", err);
                setError('Lỗi khi kiểm tra quyền admin: ' + err.message);
            } finally {
                setLoading(false); // Kết thúc trạng thái tải
            }
        };
    
        const loadPatients = async () => {
            try {
                const patientAddresses = await contract.getAllPatients(); // Lấy danh sách địa chỉ bệnh nhân từ hợp đồng
                const patientDetails = await Promise.all(
                    patientAddresses.map(async (address) => {
                        const patient = await contract.patients(address); // Lấy thông tin chi tiết từng bệnh nhân
                        return {
                            address,
                            name: patient.name,
                            phone: patient.phone,
                            homeAddress: patient.homeAddress,
                            dateOfBirth: new Date(Number(patient.dateOfBirth) * 1000).toLocaleDateString(),
                            bloodType: patient.bloodType
                        };
                    })
                );
                setPatients(patientDetails); // Cập nhật danh sách bệnh nhân
            } catch (err) {
                console.error("Lỗi khi tải danh sách bệnh nhân:", err);
                setError('Lỗi khi tải danh sách bệnh nhân: ' + err.message);
            }
        };


        if (contract) {
            checkAdmin();
            loadPatients();
        }
    }, [contract]);
    
    if (loading) {
        return (
            <Container>
                <h2 className="my-4">Danh sách Bệnh nhân</h2>
                <div>Đang kiểm tra quyền truy cập...</div>
            </Container>
        );
    }
    
    if (!isAdmin) {
        return (
            <Container>
                <Alert variant="warning" className="mt-4">
                    Bạn không phải là admin. Chỉ admin mới có quyền truy cập trang này.
                </Alert>
            </Container>
        );
    }

    return (
        <Container>
            <h2 className="my-4">Danh sách Bệnh nhân</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Địa chỉ ví</th>
                        <th>Tên</th>
                        <th>Số điện thoại</th>
                        <th>Địa chỉ</th>
                        <th>Ngày sinh</th>
                        <th>Nhóm máu</th>
                    </tr>
                </thead>
                <tbody>
                    {patients.map((patient, index) => (
                        <tr key={index}>
                            <td>{patient.address}</td>
                            <td>{patient.name}</td>
                            <td>{patient.phone}</td>
                            <td>{patient.homeAddress}</td>
                            <td>{patient.dateOfBirth}</td>
                            <td>{patient.bloodType}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
}

export default PatientList;