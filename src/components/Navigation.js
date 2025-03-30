import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Navigation({ account, isDoctor, isPatient }) {
    return (
        <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
                <Navbar.Brand as={Link} to="/">Healthcare Blockchain</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        <Nav.Link as={Link} to="/login">Login</Nav.Link>
                        <Nav.Link as={Link} to="/register">Register</Nav.Link>
                        {isPatient && <Nav.Link as={Link} to="/patient">Patient Dashboard</Nav.Link>}
                        {isDoctor && <Nav.Link as={Link} to="/doctor">Doctor Dashboard</Nav.Link>}
                        <Nav.Link as={Link} to="/admin">Admin</Nav.Link>
                        <Nav.Link as={Link} to="/admin/patients">Danh sách bệnh nhân</Nav.Link>
                    </Nav>
                    <Nav>
                        {account ? (
                            <Nav.Link disabled>
                                Connected: {account.slice(0, 6)}...{account.slice(-4)}
                            </Nav.Link>
                        ) : (
                            <Nav.Link disabled>Not Connected</Nav.Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Navigation; 