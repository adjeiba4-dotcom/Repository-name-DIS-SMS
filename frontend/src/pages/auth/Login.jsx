import LoginForm from "../../components/forms/LoginForm";

export default function Login() {
    return (
        <div
            className="container-fluid vh-100 d-flex justify-content-center align-items-center"
            style={{ background: "#F8FAFC" }}
        >
            <div className="row w-100 justify-content-center">
                <div className="col-md-5 col-lg-4">
                    <div className="card shadow p-4">

                        <div className="text-center mb-4">
                            <h2 className="fw-bold">
                                DIS-SMS
                            </h2>

                            <p className="text-muted">
                                Data Insight School Management System
                            </p>
                        </div>

                        <LoginForm />

                    </div>
                </div>
            </div>
        </div>
    );
}