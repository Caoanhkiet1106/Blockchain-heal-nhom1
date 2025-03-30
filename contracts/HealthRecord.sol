// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract HealthRecord is Ownable {
    struct Patient {
        string name;
        uint256 dateOfBirth;
        string bloodType;
        string phone;
        string homeAddress;
        bool isRegistered;
    }

    struct Doctor {
        string name;
        string department;
        string phone;
        string homeAddress;
        bool isRegistered;
    }

    struct MedicalRecord {
        uint256 timestamp;
        address doctor;
        string diagnosis;
        string prescription;
        string notes;
        string symptoms;
        string treatment;
        string followUp;
        bool isActive;
    }

    struct Appointment {
        address patient;
        address doctor;
        uint256 appointmentTime;
        string description;
        bool isConfirmed;
        bool isDone;
        bool isCanceled;
        string department;
    }

    mapping(address => Patient) public patients;
    mapping(address => Doctor) public doctors;
    mapping(address => MedicalRecord[]) private patientRecords;
    mapping(uint256 => Appointment) public appointments;
    uint256 private appointmentCounter;

    address[] private registeredDoctors;
    address[] private registeredPatients;

    event PatientRegistered(address patientAddress);
    event DoctorRegistered(address doctorAddress);
    event DoctorRemoved(address doctorAddress); // New delete 
    event DoctorInfoUpdated(address doctorAddress, string name, string department, string phone, string homeAddress); // new edit
    event AppointmentCreated(uint256 appointmentId);
    event AppointmentConfirmed(uint256 appointmentId);
    event AppointmentCompleted(uint256 appointmentId);
    event MedicalRecordAdded(address patientAddress);
    event AppointmentCanceled(uint256 appointmentId, address patient, address doctor, uint256 timestamp);

    constructor() {
        _transferOwnership(msg.sender);
    }

    function registerPatient(
        string memory _name,
        string memory _phone,
        string memory _homeAddress,
        uint256 _dateOfBirth,
        string memory _bloodType
    ) public {
        require(!patients[msg.sender].isRegistered, "Patient already registered");
        
        patients[msg.sender] = Patient({
            name: _name,
            dateOfBirth: _dateOfBirth,
            bloodType: _bloodType,
            phone: _phone,
            homeAddress: _homeAddress,
            isRegistered: true
        });

        registeredPatients.push(msg.sender);
        emit PatientRegistered(msg.sender);
    }

    function registerDoctor(
        address _doctorAddress,
        string memory _name,
        string memory _department,
        string memory _phone,
        string memory _homeAddress
    ) public onlyOwner {
        require(!doctors[_doctorAddress].isRegistered, "Doctor already registered");
        
        doctors[_doctorAddress] = Doctor({
            name: _name,
            department: _department,
            phone: _phone,
            homeAddress: _homeAddress,
            isRegistered: true
        });

        registeredDoctors.push(_doctorAddress);
        emit DoctorRegistered(_doctorAddress);
    }
        // delete doctor
    function removeDoctor(address _doctorAddress) public onlyOwner{
        require(doctors[_doctorAddress].isRegistered, "Doctor is not registerd");

        delete doctors[_doctorAddress];

        for (uint256 i = 0; i < registeredDoctors.length; i++) {
            if (registeredDoctors[i] == _doctorAddress) {
                registeredDoctors[i] = registeredDoctors[registeredDoctors.length -1];
                registeredDoctors.pop();
                break;
            }
        }
        emit DoctorRemoved(_doctorAddress);
    }

        // edit doctorinfo
    function updateDoctorInfo(
        address _doctorAddress,
        string memory _name,
        string memory _department,
        string memory _phone,
        string memory _homeAddress
    ) public {
        // Kiểm tra quyền hạn: chỉ admin hoặc chính bác sĩ được phép sửa
        require(msg.sender == _doctorAddress || msg.sender == owner(), "Not authorized");

        // Kiểm tra xem bác sĩ đã được đăng ký chưa
        require(doctors[_doctorAddress].isRegistered, "Doctor is not registered");

        // Cập nhật thông tin
        if (bytes(_name).length > 0) {
            doctors[_doctorAddress].name = _name;
        }
        if (bytes(_department).length > 0) {
            doctors[_doctorAddress].department = _department;
        }
        if (bytes(_phone).length > 0) {
            doctors[_doctorAddress].phone = _phone;
        }
        if (bytes(_homeAddress).length > 0) {
            doctors[_doctorAddress].homeAddress = _homeAddress;
        }

        // Phát sự kiện
        emit DoctorInfoUpdated(_doctorAddress, _name, _department, _phone, _homeAddress);
    }


    function createAppointment(address _doctorAddress, uint256 _appointmentTime, string memory _description) public {
        require(patients[msg.sender].isRegistered, "Patient not registered");
        require(doctors[_doctorAddress].isRegistered, "Doctor not registered");
        require(_appointmentTime > block.timestamp, "Appointment time must be in the future");

        uint256 appointmentId = appointmentCounter++;
        appointments[appointmentId] = Appointment({
            patient: msg.sender,
            doctor: _doctorAddress,
            appointmentTime: _appointmentTime,
            description: _description,
            isConfirmed: false,
            isDone: false,
            isCanceled: false,
            department: doctors[_doctorAddress].department
        });

        emit AppointmentCreated(appointmentId);
    }

    function confirmAppointment(uint256 _appointmentId) public {
        require(appointments[_appointmentId].doctor == msg.sender, "Only assigned doctor can confirm");
        require(!appointments[_appointmentId].isConfirmed, "Appointment already confirmed");
        require(!appointments[_appointmentId].isCanceled, "Appointment is canceled");

        appointments[_appointmentId].isConfirmed = true;
        emit AppointmentConfirmed(_appointmentId);
    }

    function completeAppointment(uint256 _appointmentId) public {
        require(appointments[_appointmentId].doctor == msg.sender, "Only assigned doctor can complete");
        require(appointments[_appointmentId].isConfirmed, "Appointment not confirmed");
        require(!appointments[_appointmentId].isDone, "Appointment already completed");
        require(!appointments[_appointmentId].isCanceled, "Appointment is canceled");

        appointments[_appointmentId].isDone = true;
        emit AppointmentCompleted(_appointmentId);
    }

    function cancelAppointment(uint256 _appointmentId) public {
        Appointment storage appointment = appointments[_appointmentId];
        
        require(appointment.patient != address(0), "Appointment does not exist");
        require(
            msg.sender == appointment.patient || msg.sender == appointment.doctor,
            "Only patient or doctor can cancel appointment"
        );
        require(!appointment.isDone, "Cannot cancel completed appointment");
        require(
            appointment.appointmentTime > block.timestamp,
            "Cannot cancel past appointment"
        );
        
        appointment.isCanceled = true;
        
        emit AppointmentCanceled(
            _appointmentId,
            appointment.patient,
            appointment.doctor,
            block.timestamp
        );
    }

    function addMedicalRecord(
        address _patientAddress,
        string memory _diagnosis,
        string memory _prescription,
        string memory _notes,
        string memory _symptoms,
        string memory _treatment,
        string memory _followUp
    ) public {
        require(doctors[msg.sender].isRegistered, "Only registered doctors can add records");

        MedicalRecord memory newRecord = MedicalRecord({
            timestamp: block.timestamp,
            doctor: msg.sender,
            diagnosis: _diagnosis,
            prescription: _prescription,
            notes: _notes,
            symptoms: _symptoms,
            treatment: _treatment,
            followUp: _followUp,
            isActive: true
        });

        patientRecords[_patientAddress].push(newRecord);
        emit MedicalRecordAdded(_patientAddress);
    }

    function getPatientRecords(address _patientAddress) public view returns (MedicalRecord[] memory) {
        require(
            msg.sender == _patientAddress || 
            doctors[msg.sender].isRegistered || 
            msg.sender == owner(),
            "Not authorized"
        );
        return patientRecords[_patientAddress];
    }

    function getPatientAppointments() public view returns (uint256[] memory) {
        uint256[] memory patientAppointments = new uint256[](appointmentCounter);
        uint256 count = 0;
        
        for (uint256 i = 0; i < appointmentCounter; i++) {
            if (appointments[i].patient == msg.sender) {
                patientAppointments[count] = i;
                count++;
            }
        }
        
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = patientAppointments[i];
        }
        
        return result;
    }

    function getDoctorAppointments() public view returns (uint256[] memory) {
        uint256[] memory doctorAppointments = new uint256[](appointmentCounter);
        uint256 count = 0;
        
        for (uint256 i = 0; i < appointmentCounter; i++) {
            if (appointments[i].doctor == msg.sender) {
                doctorAppointments[count] = i;
                count++;
            }
        }
        
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = doctorAppointments[i];
        }
        
        return result;
    }

    function getAppointmentsByDepartment(string memory _department) public view returns (uint256[] memory) {
        uint256[] memory departmentAppointments = new uint256[](appointmentCounter);
        uint256 count = 0;
        
        for (uint256 i = 0; i < appointmentCounter; i++) {
            if (keccak256(bytes(appointments[i].department)) == keccak256(bytes(_department))) {
                departmentAppointments[count] = i;
                count++;
            }
        }
        
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = departmentAppointments[i];
        }
        
        return result;
    }

    function getAllDoctors() public view returns (address[] memory) {
        return registeredDoctors;
    }

    function getRegisteredDoctors() public view returns (address[] memory) {
        return registeredDoctors;
    }

    function getAllPatients() public view returns (address[] memory) {
    return registeredPatients;
    }   
    
    function addMedicalRecordAndCompleteAppointment(
        address _patientAddress,
        string memory _diagnosis,
        string memory _prescription,
        string memory _notes,
        string memory _symptoms,
        string memory _treatment,
        string memory _followUp,
        uint256 _appointmentId
    ) public {
        require(doctors[msg.sender].isRegistered, "Only registered doctors can add records");
        require(appointments[_appointmentId].doctor == msg.sender, "Only assigned doctor can add record");
        require(appointments[_appointmentId].patient == _patientAddress, "Patient address does not match appointment");
        require(!appointments[_appointmentId].isDone, "Appointment already completed");
        require(appointments[_appointmentId].isConfirmed, "Appointment not confirmed");

        // Add medical record
        MedicalRecord memory newRecord = MedicalRecord({
            timestamp: block.timestamp,
            doctor: msg.sender,
            diagnosis: _diagnosis,
            prescription: _prescription,
            notes: _notes,
            symptoms: _symptoms,
            treatment: _treatment,
            followUp: _followUp,
            isActive: true
        });

        patientRecords[_patientAddress].push(newRecord);
        
        // Complete appointment
        appointments[_appointmentId].isDone = true;
        
        emit MedicalRecordAdded(_patientAddress);
        emit AppointmentCompleted(_appointmentId);
    }
} 