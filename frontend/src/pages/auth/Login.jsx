import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Mail } from "lucide-react";

import useAuth from "../../hooks/useAuth";

import Logo from "../../components/ui/Logo";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import Checkbox from "../../components/ui/Checkbox";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("admin@dissms.com");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sessionExpired = searchParams.get("reason") === "session-expired";

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message || "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-[1] w-full max-w-[var(--layout-auth-card-max)]">
      <div className="ds-panel">
        <Logo />

        {sessionExpired && !error && (
          <div className="mt-8">
            <Alert
              variant="warning"
              title="Session expired"
              message="Your session has expired. Please sign in again to continue."
              className="ds-radius-none mb-0"
            />
          </div>
        )}

        {error && (
          <div className="mt-8">
            <Alert
              variant="error"
              message={error}
              className="ds-radius-none mb-0"
            />
          </div>
        )}

        <form className="ds-form-stack mt-10" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            placeholder="Enter your email"
            className="mb-0 w-full"
            autoComplete="username"
            leftIcon={<Mail size={18} strokeWidth={1.75} />}
            onChange={(e) => setEmail(e.target.value)}
          />

          <PasswordInput
            label="Password"
            value={password}
            className="mb-0 w-full"
            autoComplete="current-password"
            leftIcon={<Lock size={18} strokeWidth={1.75} />}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="pt-1">
            <Checkbox
              id="remember"
              label="Remember Me"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              loading={loading}
              size="md"
              className="ds-btn-signin shadow-none hover:shadow-none active:scale-100"
            >
              Sign In
            </Button>
          </div>
        </form>
      </div>

      <footer className="ds-panel__footer">
        <p>Version 2.0</p>
        <p>© Data Insight Studio</p>
      </footer>
    </div>
  );
}
