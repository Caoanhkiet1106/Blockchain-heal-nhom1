import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Table } from 'react-bootstrap';
import { DEPARTMENTS } from '../constants/departments';

function AdminDashboard({ contract }) {
    const [formData, setFormData] = useState({
        doctorAddress: '',
        name: '',
        department: '',
        phone: '',
        homeAddress: ''
    });
    const [message, setMessage] = useState('');
    const [isOwner, setIsOwner] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [isEditing, setIsEditing] = useState(false); // Thêm trạng thái sửa
    const [editingDoctor, setEditingDoctor] = useState(null); // Địa chỉ bác sĩ đang sửa

    useEffect(() => {
        const checkOwner = async () => {
            if (contract) {
                try {
                    const owner = await contract.owner();
                    const accounts = await window.ethereum.request({
                        method: 'eth_requestAccounts'
                    });
                    setIsOwner(owner.toLowerCase() === accounts[0].toLowerCase());
                    if (owner.toLowerCase() === accounts[0].toLowerCase()) {
                        await loadDoctors();
                    }
                } catch (error) {
                    console.error("Lỗi khi kiểm tra owner:", error);
                    setMessage('Lỗi khi kiểm tra quyền admin: ' + error.message);
                }
            }
        };
        checkOwner();
    }, [contract]);

    const loadDoctors = async () => {
        if (!contract) return;

        try {
            console.log("Đang tải danh sách bác sĩ...");
            const addresses = await contract.getRegisteredDoctors();
            console.log("Danh sách địa chỉ:", addresses);

            const doctorDetails = await Promise.all(
                addresses.map(async (addr) => {
                    const doctor = await contract.doctors(addr);
                    console.log("Thông tin bác sĩ tại địa chỉ", addr, ":", doctor);
                    return {
                        address: addr,
                        name: doctor.name,
                        department: doctor.department,
                        phone: doctor.phone,
                        homeAddress: doctor.homeAddress,
                        isRegistered: doctor.isRegistered
                    };
                })
            );
            console.log("Chi tiết tất cả bác sĩ:", doctorDetails);
            setDoctors(doctorDetails);
        } catch (err) {
            console.error("Lỗi khi tải danh sách bác sĩ:", err);
            setMessage('Lỗi khi tải danh sách bác sĩ: ' + err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            console.log("Đang đăng ký bác sĩ với thông tin:", formData);
            const tx = await contract.registerDoctor(
                formData.doctorAddress,
                formData.name,
                formData.department,
                formData.phone,
                formData.homeAddress
            );
            console.log("Đang chờ giao dịch hoàn thành...");
            await tx.wait();
            console.log("Đăng ký thành công, đang tải lại danh sách...");

            setMessage('Đăng ký bác sĩ thành công!');
            setFormData({
                doctorAddress: '',
                name: '',
                department: '',
                phone: '',
                homeAddress: ''
            });

            setTimeout(async () => {
                await loadDoctors();
            }, 1000);

        } catch (err) {
            console.error("Lỗi khi đăng ký bác sĩ:", err);
            setMessage('Lỗi đăng ký bác sĩ: ' + err.message);
        }
    };
    // Xóa bác sĩ
    const handleRemoveDoctor = async (doctorAddress) => {
        setMessage(''); // Xóa thông báo cũ
    
        try {
            console.log("Đang xóa bác sĩ với địa chỉ:", doctorAddress);
            const tx = await contract.removeDoctor(doctorAddress); // Gọi hàm removeDoctor
            console.log("Đang chờ giao dịch hoàn thành...");
            await tx.wait();
            console.log("Xóa bác sĩ thành công, đang tải lại danh sách...");
    
            setMessage('Xóa bác sĩ thành công!');
            await loadDoctors(); // Tải lại danh sách bác sĩ sau khi xóa
        } catch (err) {
            console.error("Lỗi khi xóa bác sĩ:", err);
            setMessage('Lỗi khi xóa bác sĩ: ' + err.message);
        }
    };

    // Sửa thông tin bác sĩ
    const handleEditDoctor = (doctor) => {
        setFormData({
            doctorAddress: doctor.address,
            name: doctor.name,
            department: doctor.department,
            phone: doctor.phone,
            homeAddress: doctor.homeAddress
        });
        setEditingDoctor(doctor.address);
        setIsEditing(true); // Chuyển sang chế độ sửa
    };


    // Cập nhật thông tin bác sĩ
    const handleUpdateDoctor = async (e) => {
        e.preventDefault();
        setMessage('');
    
        try {
            console.log("Đang cập nhật thông tin bác sĩ:", formData);
            const tx = await contract.updateDoctorInfo(
                editingDoctor,
                formData.name,
                formData.department,
                formData.phone,
                formData.homeAddress
            );
            console.log("Đang chờ giao dịch hoàn thành...");
            await tx.wait();
            console.log("Cập nhật thành công, đang tải lại danh sách...");
    
            setMessage('Cập nhật thông tin bác sĩ thành công!');
            setIsEditing(false); // Thoát chế độ sửa
            setFormData({
                doctorAddress: '',
                name: '',
                department: '',
                phone: '',
                homeAddress: ''
            });
            await loadDoctors(); // Tải lại danh sách bác sĩ
        } catch (err) {
            console.error("Lỗi khi cập nhật thông tin bác sĩ:", err);
            setMessage('Lỗi cập nhật thông tin bác sĩ: ' + err.message);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (!isOwner) {
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
            <h2 className="my-4">Quản lý Hệ thống Y tế</h2>
            {message && <Alert className="mt-3" variant={message.includes('Lỗi') ? 'danger' : 'success'}>
                {message}
            </Alert>}
            <Form onSubmit={isEditing ? handleUpdateDoctor : handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Địa chỉ ví của Bác sĩ</Form.Label>
                    <Form.Control
                        type="text"
                        name="doctorAddress"
                        value={formData.doctorAddress}
                        onChange={handleChange}
                        placeholder="0x..."
                        readOnly={isEditing} // Không cho phép sửa địa chỉ khi đang chỉnh sửa
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Tên Bác sĩ</Form.Label>
                    <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Nhập tên bác sĩ"
                        required
                    />
                </Form.Group>

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
                    <Form.Label>Số Điện Thoại</Form.Label>
                    <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Nhập số điện thoại"
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Địa Chỉ</Form.Label>
                    <Form.Control
                        type="text"
                        name="homeAddress"
                        value={formData.homeAddress}
                        onChange={handleChange}
                        placeholder="Nhập địa chỉ"
                        required
                    />
                </Form.Group>

                <Button type="submit">{isEditing ? 'Cập nhật' : 'Đăng ký'}</Button>
            </Form>

            <h3 className="mt-4">Danh sách Bác sĩ đã đăng ký</h3>
            <div className="table-responsive">
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Địa chỉ ví</th>
                            <th>Tên bác sĩ</th>
                            <th>Khoa</th>
                            <th>Số điện thoại</th>
                            <th>Địa chỉ</th>
                            <th>Hành động </th>
                        </tr>
                    </thead>
                    <tbody>
                        {doctors.map((doctor, index) => (
                            <tr key={index}>
                                <td>{doctor.address}</td>
                                <td>{doctor.name}</td>
                                <td>{doctor.department}</td>
                                <td>{doctor.phone}</td>
                                <td>{doctor.homeAddress}</td>
                                <td>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => handleEditDoctor(doctor)}
                                    >
                                        Sửa
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleRemoveDoctor(doctor.address)}
                                    >
                                        xóa
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Container>
    );
}

export default AdminDashboard; 