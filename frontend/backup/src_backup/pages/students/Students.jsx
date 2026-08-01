import { useEffect, useState } from "react";

import StudentForm from "../../components/forms/StudentForm";
import {
    getStudents,
    deleteStudent,
} from "../../services/student.service";

export default function Students() {

    const [students, setStudents] = useState([]);

    const [loading, setLoading] = useState(true);

    const [editingStudent, setEditingStudent] = useState(null);

    async function loadStudents() {

        try {

            setLoading(true);

            const response = await getStudents();

            setStudents(response.data);

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Unable to load students."
            );

        } finally {

            setLoading(false);

        }

    }

    useEffect(() => {

        loadStudents();

    }, []);

    async function handleDelete(id) {

        const confirmed = window.confirm(
            "Delete this student?"
        );

        if (!confirmed) return;

        try {

            await deleteStudent(id);

            alert("Student deleted successfully.");

            loadStudents();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Delete failed."
            );

        }

    }

    return (

        <div className="container-fluid">

            <h2 className="mb-4">

                Students

            </h2>

            <div className="card shadow-sm border-0 mb-4">

                <div className="card-header">

                    <strong>

                        {editingStudent
                            ? "Edit Student"
                            : "Register Student"}

                    </strong>

                </div>

                <div className="card-body">

                    <StudentForm

                        student={editingStudent}

                        onSuccess={() => {

                            setEditingStudent(null);

                            loadStudents();

                        }}

                    />

                </div>

            </div>

            <div className="card shadow-sm border-0">

                <div className="card-header">

                    <strong>

                        Student List

                    </strong>

                </div>

                <div className="card-body">

                    {loading ? (

                        <p>Loading students...</p>

                    ) : students.length === 0 ? (

                        <p>No students found.</p>

                    ) : (

                        <table className="table table-hover table-bordered">

                            <thead>

                                <tr>

                                    <th>Admission No</th>
                                    <th>Name</th>
                                    <th>Gender</th>
                                    <th>Guardian</th>
                                    <th>Phone</th>
                                    <th width="170">Actions</th>

                                </tr>

                            </thead>

                            <tbody>

                                {students.map(student => (

                                    <tr key={student.id}>

                                        <td>{student.admissionNo}</td>

                                        <td>

                                            {student.firstName} {student.lastName}

                                        </td>

                                        <td>{student.gender}</td>

                                        <td>{student.guardianName}</td>

                                        <td>{student.guardianPhone}</td>

                                        <td>

                                            <button

                                                className="btn btn-warning btn-sm me-2"

                                                onClick={() =>
                                                    setEditingStudent(student)
                                                }

                                            >

                                                Edit

                                            </button>

                                            <button

                                                className="btn btn-danger btn-sm"

                                                onClick={() =>
                                                    handleDelete(student.id)
                                                }

                                            >

                                                Delete

                                            </button>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    )}

                </div>

            </div>

        </div>

    );

}