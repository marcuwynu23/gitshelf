import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";
import {Button, Input, Alert} from "~/components/ui";

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // TODO: Replace with actual API endpoint
      await axios.post("/api/auth/login", {email, password});
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.error || "Failed to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-app-bg px-4">
      <div className="w-full max-w-md">
        <div className="bg-app-surface border border-[#3d3d3d] rounded-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-[#e8e8e8] mb-2">
              Welcome back
            </h1>
            <p className="text-sm text-[#b0b0b0]">
              Sign in to your Repohub account
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-[#b0b0b0] cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[#3d3d3d] bg-app-surface text-app-accent focus:ring-app-accent"
                />
                <span>Remember me</span>
              </label>
              <Link
                to="/auth/recovery"
                className="text-app-accent hover:text-[#5a95f5] transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Sign up link */}
          <div className="mt-6 text-center text-sm text-[#b0b0b0]">
            Don't have an account?{" "}
            <Link
              to="/auth/register"
              className="text-app-accent hover:text-[#5a95f5] transition-colors font-medium"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
