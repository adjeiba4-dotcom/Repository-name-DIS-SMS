const attendanceRepository = require("../repositories/attendance.repository");

exports.getAttendance = async() => {
    return await attendanceRepository.findAllAttendance();
};

exports.getAttendanceById = async(id) => {
    const attendance =
        await attendanceRepository.findAttendanceById(id);

    if (!attendance) {
        throw new Error("Attendance record not found.");
    }

    return attendance;
};

exports.createAttendance = async(attendanceData) => {
    return await attendanceRepository.createAttendance(
        attendanceData
    );
};

exports.updateAttendance = async(id, attendanceData) => {
    const existingAttendance =
        await attendanceRepository.findAttendanceById(id);

    if (!existingAttendance) {
        throw new Error("Attendance record not found.");
    }

    return await attendanceRepository.updateAttendance(
        id,
        attendanceData
    );
};

exports.deleteAttendance = async(id) => {
    const existingAttendance =
        await attendanceRepository.findAttendanceById(id);

    if (!existingAttendance) {
        throw new Error("Attendance record not found.");
    }

    await attendanceRepository.deleteAttendance(id);

    return {
        id: Number(id),
    };
};