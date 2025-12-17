import {useState} from "react";
import {Link} from "react-router-dom";
import axios from "axios";
import {Button, Input, Alert} from "~/components/ui";

export const Recovery = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // TODO: Replace with actual API endpoint
      await axios.post("/api/auth/recovery", {email});
      setSuccess(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          "Failed to send recovery email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg px-4">
        <div className="w-full max-w-md">
          <div className="bg-app-surface border border-[#3d3d3d] rounded-lg p-8">
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-app-accent/10 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-app-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-semibold text-[#e8e8e8] mb-2">
                Check your email
              </h1>
              <p className="text-sm text-[#b0b0b0] mb-6">
                We've sent a password recovery link to{" "}
                <strong className="text-[#e8e8e8]">{email}</strong>
              </p>
              <Link to="/auth/login">
                <Button variant="secondary" className="w-full">
                  Back to sign in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-app-bg px-4">
      <div className="w-full max-w-md">
        <div className="bg-app-surface border border-[#3d3d3d] rounded-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-[#e8e8e8] mb-2">
              Reset password
            </h1>
            <p className="text-sm text-[#b0b0b0]">
              Enter your email address and we'll send you a link to reset your
              password
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          {/* Recovery Form */}
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send recovery link"}
            </Button>
          </form>

          {/* Sign in link */}
          <div className="mt-6 text-center text-sm text-[#b0b0b0]">
            Remember your password?{" "}
            <Link
              to="/auth/login"
              className="text-app-accent hover:text-[#5a95f5] transition-colors font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
