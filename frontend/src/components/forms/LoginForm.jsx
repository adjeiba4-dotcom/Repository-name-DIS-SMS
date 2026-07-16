import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import { login } from "../../services/auth.service";

export default function LoginForm() {
    const navigate = useNavigate();

    const { login: loginUser } = useAuth();

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const data = await login(email, password);

            loginUser(data.user, data.token);

            navigate("/dashboard");
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Login failed."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label className="form-label">
                    Email
                </label>

                <input
                    className="form-control"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <div className="mb-4">
                <label className="form-label">
                    Password
                </label>

                <input
                    className="form-control"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            <button
                className="btn btn-primary w-100"
                type="submit"
                disabled={loading}
            >
                {loading ? "Signing In..." : "Login"}
            </button>
        </form>
    );
}