import { useEffect, useState } from "react";
import { getStudents } from "../../services/student.service";

export default function Students() {

    const [students, setStudents] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStudents();
    }, []);

    async function loadStudents() {

        try {

            const response = await getStudents();

            setStudents(response.data);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }

    }

    if (loading) {

        return <h4>Loading students...</h4>;

    }

    return (

        <div className="container-fluid">

            <h2 className="mb-4">
                Students
            </h2>

            <div className="card shadow-sm">

                <div className="card-body">

                    <h5 className="mb-3">
                        Total Students: {students.length}
                    </h5>

                    {
                        students.length === 0 ?

                        (
                            <div className="alert alert-info">

                                No students found.

                            </div>
                        )

                        :

                        (
                            <table className="table table-striped">

                                <thead>

                                    <tr>

                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Admission No.</th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {
                                        students.map(student => (

                                            <tr key={student.id}>

                                                <td>{student.id}</td>

                                                <td>

                                                    {student.firstName} {student.lastName}

                                                </td>

                                                <td>

                                                    {student.admissionNumber}

                                                </td>

                                            </tr>

                                        ))
                                    }

                                </tbody>

                            </table>
                        )

                    }

                </div>

            </div>

        </div>

    );

}