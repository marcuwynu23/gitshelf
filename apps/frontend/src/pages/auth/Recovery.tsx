import {useState} from "react";
import {Link} from "react-router-dom";
import axios from "axios";
import {Button, Input, Alert} from "~/components/ui";
import {AuthLayout} from "~/components/layout/AuthLayout";
import Logo from "~/assets/logo.svg";

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
      await axios.post("/api/auth/recovery", {email});
      setSuccess(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
          "Failed to send recovery email. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout>
        {/* Brand Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="lg:hidden inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6 mx-auto">
            <img
              src={Logo}
              alt="GitShelf"
              className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-lg"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#e8e8e8] tracking-tight mb-2">
            Check your email
          </h1>
        </div>

        <div className="w-full px-4 sm:px-0 animate-slideUp">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-app-accent/10 rounded-full flex items-center justify-center mx-auto ring-4 ring-app-accent/5 animate-bounce">
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            <p className="text-[#b0b0b0] mb-8 leading-relaxed">
              We've sent a password recovery link to <br />
              <strong className="text-[#e8e8e8] font-medium">{email}</strong>
            </p>

            <Link to="/auth/login">
              <Button
                variant="secondary"
                className="w-full h-11 text-base font-medium bg-[#2a2a2a] border-[#3d3d3d] hover:bg-[#333] hover:border-[#4d4d4d] transition-all"
              >
                Back to sign in
              </Button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      {/* Brand Header */}
      <div className="text-center lg:text-left mb-8 animate-fadeIn">
        <div className="lg:hidden inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6 mx-auto">
          <img src={Logo} alt="GitShelf" className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#e8e8e8] tracking-tight mb-2">
          Reset password
        </h1>
        <p className="text-[#b0b0b0] text-base sm:text-lg">
          Enter your email to receive instructions
        </p>
      </div>

      <div className="w-full px-4 sm:px-0 animate-slideUp">
        {/* Error Alert */}
        {error && (
          <Alert variant="error" className="mb-6 animate-shake">
            {error}
          </Alert>
        )}

        {/* Recovery Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="h-11 !bg-[#1c2128] border-[#30363d] focus:border-app-accent focus:ring-app-accent/20 transition-all"
          />

          <Button
            type="submit"
            className="w-full h-11 text-base font-medium shadow-lg shadow-app-accent/20 hover:shadow-app-accent/30 transition-all"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Sending...</span>
              </div>
            ) : (
              "Send recovery link"
            )}
          </Button>
        </form>
      </div>

      {/* Sign in link */}
      <p className="mt-8 text-center text-sm text-[#b0b0b0] animate-fadeIn delay-100">
        Remember your password?{" "}
        <Link
          to="/auth/login"
          className="text-app-accent hover:text-[#5a95f5] transition-colors font-medium hover:underline decoration-app-accent/30 underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};
