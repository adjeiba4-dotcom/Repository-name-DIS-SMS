export default function QuickActions() {
    return (
        <div className="card shadow-sm border-0">
            <div className="card-body">

                <h5 className="mb-3">
                    Quick Actions
                </h5>

                <div className="d-grid gap-2">

                    <button className="btn btn-primary">
                        Add Student
                    </button>

                    <button className="btn btn-success">
                        Add Teacher
                    </button>

                    <button className="btn btn-warning">
                        Record Payment
                    </button>

                </div>

            </div>
        </div>
    );
}