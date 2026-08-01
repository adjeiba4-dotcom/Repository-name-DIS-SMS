import { useEffect, useState } from "react";
import teacherService from "../services/teacher.service";

const TeacherForm = ({ teacher, onClose }) => {
    const [formData, setFormData] = useState({
        staffNo: "",
        firstName: "",
        lastName: "",
        gender: "",
        email: "",
        phone: "",
        department: "",
        position: "",
        status: "Active",
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (teacher) {
            setFormData({
                staffNo: teacher.staffNo || "",
                firstName: teacher.firstName || "",
                lastName: teacher.lastName || "",
                gender: teacher.gender || "",
                email: teacher.email || "",
                phone: teacher.phone || "",
                department: teacher.department || "",
                position: teacher.position || "",
                status: teacher.status || "Active",
            });
        }
    }, [teacher]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            if (teacher) {
                await teacherService.updateTeacher(
                    teacher.id,
                    formData
                );
            } else {
                await teacherService.createTeacher(formData);
            }

            alert(
                teacher
                    ? "Teacher updated successfully."
                    : "Teacher created successfully."
            );

            onClose();
        } catch (error) {
            console.error(error);
            alert("Unable to save teacher.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="modal d-block"
            style={{
                background: "rgba(0,0,0,.5)",
            }}
        >
            <div className="modal-dialog modal-lg">
                <div className="modal-content">

                    <div className="modal-header">

                        <h5 className="modal-title">

                            {teacher
                                ? "Edit Teacher"
                                : "Add Teacher"}

                        </h5>

                        <button
                            className="btn-close"
                            onClick={onClose}
                        ></button>

                    </div>

                    <form onSubmit={handleSubmit}>

                        <div className="modal-body">

                            <div className="row">

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">
                                        Staff Number
                                    </label>

                                    <input
                                        type="text"
                                        name="staffNo"
                                        className="form-control"
                                        value={formData.staffNo}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">
                                        First Name
                                    </label>

                                    <input
                                        type="text"
                                        name="firstName"
                                        className="form-control"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">
                                        Last Name
                                    </label>

                                    <input
                                        type="text"
                                        name="lastName"
                                        className="form-control"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">
                                        Gender
                                    </label>

                                    <select
                                        name="gender"
                                        className="form-select"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Select Gender
                                        </option>

                                        <option value="Male">
                                            Male
                                        </option>

                                        <option value="Female">
                                            Female
                                        </option>

                                    </select>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">
                                        Phone
                                    </label>

                                    <input
                                        type="text"
                                        name="phone"
                                        className="form-control"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">
                                        Department
                                    </label>

                                    <input
                                        type="text"
                                        name="department"
                                        className="form-control"
                                        value={formData.department}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">
                                        Position
                                    </label>

                                    <input
                                        type="text"
                                        name="position"
                                        className="form-control"
                                        value={formData.position}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label">
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        className="form-select"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        <option value="Active">
                                            Active
                                        </option>

                                        <option value="Inactive">
                                            Inactive
                                        </option>

                                    </select>
                                </div>

                            </div>

                        </div>

                        <div className="modal-footer">

                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading
                                    ? "Saving..."
                                    : teacher
                                    ? "Update Teacher"
                                    : "Save Teacher"}
                            </button>

                        </div>

                    </form>

                </div>
            </div>
        </div>
    );
};

export default TeacherForm;