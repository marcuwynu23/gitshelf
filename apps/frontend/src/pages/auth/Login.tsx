import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {Button, Input, Alert} from "~/components/ui";
import {AuthLayout} from "~/components/layout/AuthLayout";
import {useAuthStore} from "~/stores/authStore";
import Logo from "~/assets/logo.svg";

export const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Brand Header */}
      <div className="text-center lg:text-left mb-8 animate-fadeIn">
        <div className="lg:hidden inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6 mx-auto">
          <img src={Logo} alt="GitShelf" className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#e8e8e8] tracking-tight mb-2">
          Welcome back
        </h1>
        <p className="text-[#b0b0b0] text-base sm:text-lg">
          Sign in to continue to{" "}
          <span className="text-[#e8e8e8] font-medium">GitShelf</span>
        </p>
      </div>

      <div className="w-full px-4 sm:px-0 animate-slideUp">
        {/* Error Alert */}
        {error && (
          <Alert variant="error" className="mb-6 animate-shake">
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <Input
              label="Username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="h-11 !bg-[#1c2128] border-[#30363d] focus:border-app-accent focus:ring-app-accent/20 transition-all"
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-[#e8e8e8]">
                  Password
                </label>
                <Link
                  to="/auth/recovery"
                  className="text-xs text-app-accent hover:text-[#5a95f5] transition-colors font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="h-11 !bg-[#1c2128] border-[#30363d] focus:border-app-accent focus:ring-app-accent/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="checkbox" className="peer sr-only" />
                <div className="w-5 h-5 border-2 border-[#3d3d3d] rounded bg-[#161616] peer-checked:bg-app-accent peer-checked:border-app-accent transition-all"></div>
                <svg
                  className="absolute w-3.5 h-3.5 text-white left-0.5 top-0.5 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-sm text-[#b0b0b0] group-hover:text-[#e8e8e8] transition-colors">
                Remember me
              </span>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-base font-medium shadow-lg shadow-app-accent/20 hover:shadow-app-accent/30 transition-all"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </div>

      {/* Sign up link */}
      <p className="mt-8 text-center text-sm text-[#b0b0b0] animate-fadeIn delay-100">
        Don't have an account?{" "}
        <Link
          to="/auth/register"
          className="text-app-accent hover:text-[#5a95f5] transition-colors font-medium hover:underline decoration-app-accent/30 underline-offset-4"
        >
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
};
