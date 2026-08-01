const TeacherTable = ({
    teachers,
    onEdit,
    onDelete,
}) => {
    if (!teachers || teachers.length === 0) {
        return (
            <div className="alert alert-info text-center">
                No teachers found.
            </div>
        );
    }

    return (
        <div className="table-responsive">

            <table className="table table-bordered table-hover align-middle">

                <thead className="table-dark">

                    <tr>
                        <th>#</th>
                        <th>Staff No</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Gender</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Department</th>
                        <th>Position</th>
                        <th>Status</th>
                        <th className="text-center">
                            Actions
                        </th>
                    </tr>

                </thead>

                <tbody>

                    {teachers.map((teacher, index) => (

                        <tr key={teacher.id}>

                            <td>{index + 1}</td>

                            <td>{teacher.staffNo}</td>

                            <td>{teacher.firstName}</td>

                            <td>{teacher.lastName}</td>

                            <td>{teacher.gender}</td>

                            <td>{teacher.email}</td>

                            <td>{teacher.phone}</td>

                            <td>{teacher.department}</td>

                            <td>{teacher.position}</td>

                            <td>

                                <span
                                    className={
                                        teacher.status === "Active"
                                            ? "badge bg-success"
                                            : "badge bg-danger"
                                    }
                                >
                                    {teacher.status}
                                </span>

                            </td>

                            <td className="text-center">

                                <button
                                    className="btn btn-warning btn-sm me-2"
                                    onClick={() =>
                                        onEdit(teacher)
                                    }
                                >
                                    Edit
                                </button>

                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() =>
                                        onDelete(teacher)
                                    }
                                >
                                    Delete
                                </button>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );
};

export default TeacherTable;