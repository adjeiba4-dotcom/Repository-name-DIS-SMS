import { useEffect, useState } from "react";
import {
    createStudent,
    updateStudent,
} from "../../services/student.service";

const initialState = {
    admissionNo: "",
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    guardianName: "",
    guardianPhone: "",
    phone: "",
    email: "",
    address: "",
    classId: "",
};

export default function StudentForm({
    student = null,
    onSuccess,
}) {

    const [formData, setFormData] = useState(initialState);

    const [loading, setLoading] = useState(false);

    useEffect(() => {

        if (student) {

            setFormData({
                ...initialState,
                ...student,
                dateOfBirth:
                    student.dateOfBirth?.substring(0, 10) || "",
            });

        } else {

            setFormData(initialState);

        }

    }, [student]);

    function handleChange(e) {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

    }

    async function handleSubmit(e) {

    e.preventDefault();

    console.log("🚀 Submit clicked");
    console.log("Student Data:", formData);

    try {

        setLoading(true);

            if (student) {

                await updateStudent(student.id, formData);

                alert("Student updated successfully.");

            } else {

                console.log("📤 Sending request to backend...");

await createStudent(formData);

console.log("✅ Backend request completed.");

alert("Student registered successfully.");

            }

            if (onSuccess) {

                onSuccess();

            }

            if (!student) {

                setFormData(initialState);

            }

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Unable to save student."
            );

        } finally {

            setLoading(false);

        }

    }

    return (
    <>  
                <form onSubmit={handleSubmit} className="card shadow-sm p-4">

            <h4 className="mb-4">
                {student ? "Edit Student" : "Register Student"}
            </h4>

            <div className="row">

                <div className="col-md-6 mb-3">
                    <label className="form-label">
                        Admission No
                    </label>
                    <input
                        type="text"
                        name="admissionNo"
                        className="form-control"
                        value={formData.admissionNo}
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
                        Date of Birth
                    </label>
                    <input
                        type="date"
                        name="dateOfBirth"
                        className="form-control"
                        value={formData.dateOfBirth}
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
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>
                 <div className="col-md-6 mb-3">
                    <label className="form-label">
                        Guardian Name
                    </label>
                    <input
                        type="text"
                        name="guardianName"
                        className="form-control"
                        value={formData.guardianName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="col-md-6 mb-3">
                    <label className="form-label">
                        Guardian Phone
                    </label>
                    <input
                        type="text"
                        name="guardianPhone"
                        className="form-control"
                        value={formData.guardianPhone}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="col-12 mb-3">
                    <label className="form-label">
                        Address
                    </label>
                    <textarea
                        name="address"
                        className="form-control"
                        rows="3"
                        value={formData.address}
                        onChange={handleChange}
                    />
                </div>

            </div>

            <div className="d-flex justify-content-end">
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading
                        ? "Saving..."
                        : student
                            ? "Update Student"
                            : "Register Student"}
                </button>
            </div>

        </form>
    </>
);
}           