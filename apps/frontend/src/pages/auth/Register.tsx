import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {Button, Input, Alert} from "~/components/ui";
import {AuthLayout} from "~/components/layout/AuthLayout";
import {useAuthStore} from "~/stores/authStore";
import Logo from "~/assets/logo.svg";

export const Register = () => {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      await register(
        formData.username,
        formData.name,
        formData.email,
        formData.password,
      );
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to register. Please try again.");
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
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mb-2">
          Create an account
        </h1>
        <p className="text-text-secondary text-base sm:text-lg">
          Join <span className="text-text-primary font-medium">GitShelf</span>{" "}
          today
        </p>
      </div>

      <div className="w-full px-4 sm:px-0 animate-slideUp">
        {/* Error Alert */}
        {error && (
          <Alert variant="error" className="mb-6 animate-shake">
            {error}
          </Alert>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Username"
                type="text"
                name="username"
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
                required
                autoComplete="username"
                className="h-11 !bg-app-surface border-app-border focus:border-app-accent focus:ring-app-accent/20 transition-all"
              />

              <Input
                label="Full Name"
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
                className="h-11 !bg-app-surface border-app-border focus:border-app-accent focus:ring-app-accent/20 transition-all"
              />
            </div>

            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="h-11 !bg-app-surface border-app-border focus:border-app-accent focus:ring-app-accent/20 transition-all"
            />

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              helperText="Must be at least 8 characters"
              className="h-11 !bg-app-surface border-app-border focus:border-app-accent focus:ring-app-accent/20 transition-all"
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              className="h-11 !bg-app-surface border-app-border focus:border-app-accent focus:ring-app-accent/20 transition-all"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-base font-medium shadow-lg shadow-app-accent/20 hover:shadow-app-accent/30 transition-all mt-2"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-text-on-accent/30 border-t-text-on-accent rounded-full animate-spin" />
                <span>Creating account...</span>
              </div>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      </div>

      {/* Sign in link */}
      <p className="mt-8 text-center text-sm text-text-secondary animate-fadeIn delay-100">
        Already have an account?{" "}
        <Link
          to="/auth/login"
          className="text-app-accent hover:text-app-accent-hover transition-colors font-medium hover:underline decoration-app-accent/30 underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};
