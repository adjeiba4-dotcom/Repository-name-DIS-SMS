import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <nav className="navbar navbar-dark bg-primary shadow-sm">
            <div className="container-fluid">

                <span className="navbar-brand fw-bold">
                    DIS-SMS
                </span>

                <div className="d-flex align-items-center gap-3">

                    <div className="text-end text-white">

                        <div className="small">
                            Welcome
                        </div>

                        <strong>

                            <FaUserCircle className="me-2" />

                            {user
                                ? `${user.firstName} ${user.lastName}`
                                : "Guest"}

                        </strong>

                    </div>

                    <button
                        className="btn btn-light btn-sm"
                        onClick={handleLogout}
                    >

                        <FaSignOutAlt className="me-2" />

                        Logout

                    </button>

                </div>

            </div>
        </nav>
    );
}