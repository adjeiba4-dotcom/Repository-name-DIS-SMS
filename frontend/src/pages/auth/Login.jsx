import { useState } from "react";
import { useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";

import Logo from "../../components/ui/Logo";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import Checkbox from "../../components/ui/Checkbox";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("admin@dissms.com");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(true);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            await login(email, password);
            navigate("/");
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                "Invalid email or password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[400px]">
            <div className="rounded-[var(--radius-xl)] border border-[var(--color-card-border)] bg-white p-10 shadow-[var(--shadow-sm)]">
                <Logo />

                {error && (
                    <div className="mt-8">
                        <Alert
                            variant="error"
                            message={error}
                        />
                    </div>
                )}

                <form
                    className="mt-10 flex flex-col gap-7"
                    onSubmit={handleSubmit}
                >
                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        placeholder="Enter your email"
                        className="mb-0 w-full"
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                    />

                    <PasswordInput
                        label="Password"
                        value={password}
                        className="mb-0 w-full"
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                    />

                    <div className="pt-1">
                        <Checkbox
                            id="remember"
                            label="Remember Me"
                            checked={remember}
                            onChange={(e) =>
                                setRemember(e.target.checked)
                            }
                        />
                    </div>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            loading={loading}
                            size="md"
                            className="h-12 w-full rounded-[var(--radius-lg)] shadow-none hover:shadow-none active:scale-100"
                        >
                            Sign In
                        </Button>
                    </div>
                </form>
            </div>

            <footer className="mt-8 space-y-1 text-center text-[var(--font-size-xs)] text-[var(--color-footer-text)]">
                <p>Version 2.0</p>
                <p>© Data Insight Studio</p>
            </footer>
        </div>
    );
}
