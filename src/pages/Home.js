import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <Container>
            <Row className="mb-4">
                <Col>
                    <h1 className="text-center mb-4">Hệ Thống Quản Lý Hồ Sơ Y Tế</h1>
                    <p className="lead text-center">
                        Nền tảng an toàn và minh bạch để quản lý hồ sơ y tế bằng công nghệ blockchain
                    </p>
                    <div className="text-center">
                        <Button as={Link} to="/register" variant="primary" size="lg" className="me-3">
                            Đăng Ký Ngay
                        </Button>
                        <Button as={Link} to="/login" variant="outline-primary" size="lg">
                            Đăng Nhập
                        </Button>
                    </div>
                </Col>
            </Row>

            <Row>
                <Col md={4}>
                    <Card className="mb-4 h-100">
                        <Card.Body>
                            <Card.Title className="text-primary">Cho Bệnh Nhân</Card.Title>
                            <Card.Text>
                                <ul className="list-unstyled">
                                    <li>✓ Lưu trữ hồ sơ y tế an toàn</li>
                                    <li>✓ Kiểm soát quyền truy cập dữ liệu</li>
                                    <li>✓ Xem lịch sử khám bệnh đầy đủ</li>
                                    <li>✓ Đặt lịch khám trực tuyến</li>
                                    <li>✓ Hủy lịch khám dễ dàng</li>
                                </ul>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="mb-4 h-100">
                        <Card.Body>
                            <Card.Title className="text-primary">Cho Bác Sĩ</Card.Title>
                            <Card.Text>
                                <ul className="list-unstyled">
                                    <li>✓ Truy cập hồ sơ bệnh nhân an toàn</li>
                                    <li>✓ Thêm hồ sơ bệnh án mới</li>
                                    <li>✓ Xem lịch sử bệnh nhân</li>
                                    <li>✓ Xác nhận lịch hẹn</li>
                                    <li>✓ Cập nhật trạng thái khám</li>
                                </ul>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="mb-4 h-100">
                        <Card.Body>
                            <Card.Title className="text-primary">Lợi Ích</Card.Title>
                            <Card.Text>
                                <ul className="list-unstyled">
                                    <li>✓ Dữ liệu không thể sửa đổi</li>
                                    <li>✓ Bảo mật thông tin cao</li>
                                    <li>✓ Kiểm soát quyền truy cập minh bạch</li>
                                    <li>✓ Phối hợp chăm sóc hiệu quả</li>
                                    <li>✓ Tiết kiệm thời gian và chi phí</li>
                                </ul>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-4">
                <Col>
                    <Card className="bg-light">
                        <Card.Body>
                            <h2 className="text-center mb-4">Cách Hoạt Động</h2>
                            <p className="text-center">
                                Nền tảng của chúng tôi sử dụng công nghệ blockchain để đảm bảo hồ sơ y tế của bạn
                                được bảo mật, không thể sửa đổi và chỉ có thể truy cập bởi các nhà cung cấp dịch vụ
                                y tế được ủy quyền. Bạn hoàn toàn kiểm soát được việc ai có thể truy cập thông tin
                                sức khỏe của mình.
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Home; 