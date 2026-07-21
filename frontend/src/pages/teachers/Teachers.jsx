import { useEffect, useState } from "react";
import teacherService from "../../services/teacher.service";
import TeacherTable from "../../components/TeacherTable";
import TeacherForm from "../../components/TeacherForm";

const Teachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [error, setError] = useState("");

    const loadTeachers = async (keyword = "") => {
        try {
            setLoading(true);

            const response = await teacherService.getTeachers(keyword);

            if (response.success) {
                setTeachers(response.data);
            } else {
                setTeachers([]);
            }

            setError("");
        } catch (err) {
            console.error(err);
            setError("Unable to load teachers.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTeachers(search);
    }, [search]);

    const handleAdd = () => {
        setSelectedTeacher(null);
        setShowForm(true);
    };

    const handleEdit = (teacher) => {
        setSelectedTeacher(teacher);
        setShowForm(true);
    };

    const handleDelete = async (teacher) => {
        const confirmDelete = window.confirm(
            `Delete ${teacher.firstName} ${teacher.lastName}?`
        );

        if (!confirmDelete) return;

        try {
            await teacherService.deleteTeacher(teacher.id);
            loadTeachers(search);
        } catch (error) {
            alert("Unable to delete teacher.");
        }
    };

    const handleClose = () => {
        setShowForm(false);
        setSelectedTeacher(null);
        loadTeachers(search);
    };

    return (
        <div className="container-fluid mt-4">

            <div className="d-flex justify-content-between align-items-center mb-4">

                <h2 className="fw-bold">
                    Teacher Management
                </h2>

                <button
                    className="btn btn-primary"
                    onClick={handleAdd}
                >
                    + Add Teacher
                </button>

            </div>

            <div className="card shadow-sm">

                <div className="card-body">

                    <div className="row mb-3">

                        <div className="col-md-5">

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by name, email or staff number..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />

                        </div>

                    </div>

                    {loading ? (

                        <div className="text-center py-5">

                            <div
                                className="spinner-border text-primary"
                                role="status"
                            >
                                <span className="visually-hidden">
                                    Loading...
                                </span>
                            </div>

                        </div>

                    ) : error ? (

                        <div className="alert alert-danger">
                            {error}
                        </div>

                    ) : (

                        <TeacherTable
                            teachers={teachers}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />

                    )}

                </div>

            </div>

            {showForm && (

                <TeacherForm
                    teacher={selectedTeacher}
                    onClose={handleClose}
                />

            )}

        </div>
    );
};

export default Teachers;