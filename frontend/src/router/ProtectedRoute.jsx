import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, user } = useAuth();

    console.log("ProtectedRoute");
    console.log("isAuthenticated:", isAuthenticated);
    console.log("user:", user);
    console.log("token:", localStorage.getItem("token"));

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}