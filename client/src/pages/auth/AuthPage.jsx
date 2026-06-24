import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../../components/auth/AuthForm";
import AuthIllustration from "../../components/auth/AuthIllustration";
import { getCurrentUser, logout, signin, signup, verifyEmail, resendCode, forgotPassword, resetPassword } from "../../api/auth";

const TOKEN_KEY = "auth_token";

function PageShell({ children }) {
  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-canvas)" }}
    >
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 p-4 sm:grid sm:grid-cols-[1.1fr_0.9fr] sm:p-6">
        <AuthIllustration />
        {children}
      </div>
    </main>
  );
}

function AuthCard({ children, compact }) {
  return (
    <div
      className={`rounded-[12px] border border-[var(--color-hairline-strong)] bg-[var(--color-surface-card)] p-8 ${
        compact ? "text-center" : ""
      }`}
    >
      {children}
    </div>
  );
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin");
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [verificationCode, setVerificationCode] = useState("");

  useEffect(() => {
    if (!token) return;

    const loadCurrentUser = async () => {
      try {
        const data = await getCurrentUser(token);
        setUser(data.user);
        navigate("/home", { replace: true });
      } catch (err) {
        localStorage.removeItem(TOKEN_KEY);
        setToken("");
        setUser(null);
        setError(err.message || "Session expired");
      }
    };

    loadCurrentUser();
  }, [navigate, token]);

  const greeting = useMemo(() => {
    if (!user) return null;
    return {
      title: `Hello, ${user.name}`,
      subtitle: "Your account is active and ready.",
    };
  }, [user]);

  const onInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("Processing...");
    setLoading(true);

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
      };

      if (mode === "signup") {
        const data = await signup({ ...payload, name: formData.name });
        setStatus(data.message);
        setFormData({ name: "", password: "" });
        setMode("verification-sent");
      } else {
        const data = await signin(payload);
        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
        setUser(data.user);
        setStatus(data.message);
        setFormData({ name: "", email: "", password: "" });
        navigate("/home", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  const onVerifyCode = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("Verifying...");
    setLoading(true);

    try {
      const data = await verifyEmail(formData.email, verificationCode);
      setStatus(data.message);
      setVerificationCode("");
      setMode("verified");
    } catch (err) {
      setError(err.message || "Verification failed");
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  const onResendCode = async () => {
    setError("");
    setStatus("Sending...");
    setLoading(true);

    try {
      const data = await resendCode(formData.email);
      setStatus(data.message);
    } catch (err) {
      setError(err.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  const onForgotPassword = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("Sending...");
    setLoading(true);

    try {
      const data = await forgotPassword(formData.email);
      setStatus(data.message);
      setFormData({ password: "" });
      setMode("reset-code");
    } catch (err) {
      setError(err.message || "Failed to send reset code");
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("Resetting...");
    setLoading(true);

    try {
      const data = await resetPassword(formData.email, verificationCode, formData.password);
      setStatus(data.message);
      setVerificationCode("");
      setFormData({ name: "", email: "", password: "" });
      setMode("password-reset");
    } catch (err) {
      setError(err.message || "Failed to reset password");
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  const onLogout = async () => {
    setError("");
    setLoading(true);

    try {
      const data = await logout();
      setStatus(data.message || "Logged out");
    } catch {
      setStatus("Logged out");
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setToken("");
      setUser(null);
      setLoading(false);
    }
  };

  if (user) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: "var(--color-canvas)" }}>
        <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl items-center gap-6 p-4 sm:grid sm:grid-cols-[1.1fr_0.9fr] sm:p-6">
          <AuthIllustration />
          <AuthCard>
            <div className="inline-flex rounded-full border border-[var(--color-hairline)] bg-[var(--color-surface-elevated)] px-3 py-1 text-xs text-[var(--color-accent-green)]">
              Authenticated
            </div>
            <h1
              className="mt-5 text-3xl font-medium leading-none tracking-tight text-[var(--color-ink)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {greeting.title}
            </h1>
            <p className="mt-2 text-sm text-[var(--color-body)]">{greeting.subtitle}</p>

            <div className="mt-8 rounded-[8px] border border-[var(--color-hairline)] bg-[var(--color-surface-elevated)] p-5">
              <p className="text-sm font-medium text-[var(--color-charcoal)]">Current user</p>
              <div className="mt-4 space-y-2 text-sm text-[var(--color-body)]">
                <p><span className="font-medium text-[var(--color-ink)]">Name:</span> {user.name}</p>
                <p><span className="font-medium text-[var(--color-ink)]">Email:</span> {user.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              disabled={loading}
              className="mt-6 h-9 w-full rounded-[8px] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-on)] transition hover:bg-[var(--color-body)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Logging out..." : "Logout"}
            </button>
          </AuthCard>
        </div>
      </main>
    );
  }

  if (mode === "verification-sent" || mode === "verified") {
    return (
      <PageShell>
        <AuthCard compact>
          {mode === "verified" ? (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-green)]/10 text-lg text-[var(--color-accent-green)]">
                ✓
              </div>
              <h1 className="text-xl font-medium text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
                Email verified!
              </h1>
              <p className="mt-2 text-sm text-[var(--color-body)]">{status}</p>
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="mt-6 h-9 w-full rounded-[8px] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-on)] transition hover:bg-[var(--color-body)]"
              >
                Go to sign in
              </button>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-blue)]/10 text-lg text-[var(--color-accent-blue)]">
                ✉
              </div>
              <h1 className="text-xl font-medium text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
                Check your email
              </h1>
              <p className="mt-2 text-sm text-[var(--color-body)]">
                Enter the email and the 6-digit code we sent to activate your account.
              </p>

              <form onSubmit={onVerifyCode} className="mt-6 space-y-4 text-left">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="h-10 w-full rounded-[8px] border border-[var(--color-hairline-strong)] bg-[var(--color-surface-card)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-stone)] focus:border-[var(--color-ink)]"
                  required
                />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="h-10 w-full rounded-[8px] border border-[var(--color-hairline-strong)] bg-[var(--color-surface-card)] px-3.5 py-2.5 text-center text-2xl tracking-[0.5em] text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-stone)] focus:border-[var(--color-ink)]"
                  required
                />

                {error ? (
                  <p className="rounded-[8px] border border-[var(--color-accent-red)]/20 bg-[var(--color-accent-red)]/10 px-4 py-3 text-sm text-[var(--color-accent-red)]">{error}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={loading || !formData.email || verificationCode.length < 6}
                  className="h-9 w-full rounded-[8px] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-on)] transition hover:bg-[var(--color-body)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify email"}
                </button>
              </form>

              <div className="mt-4 flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={onResendCode}
                  disabled={loading}
                  className="text-sm text-[var(--color-link)] transition hover:text-[var(--color-accent-blue)] disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Resend code"}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="text-sm text-[var(--color-charcoal)] transition hover:text-[var(--color-ink)]"
                >
                  Back to sign in
                </button>
              </div>
            </>
          )}
        </AuthCard>
      </PageShell>
    );
  }

  if (mode === "forgot-password") {
    return (
      <PageShell>
        <AuthCard compact>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-orange)]/10 text-lg text-[var(--color-accent-orange)]">
            ?
          </div>
          <h1 className="text-xl font-medium text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
            Forgot password
          </h1>
          <p className="mt-2 text-sm text-[var(--color-body)]">
            Enter your email and we'll send you a reset code.
          </p>

          <form onSubmit={onForgotPassword} className="mt-6 space-y-4 text-left">
            <input
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className="h-10 w-full rounded-[8px] border border-[var(--color-hairline-strong)] bg-[var(--color-surface-card)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-stone)] focus:border-[var(--color-ink)]"
              required
            />

            {error ? (
              <p className="rounded-[8px] border border-[var(--color-accent-red)]/20 bg-[var(--color-accent-red)]/10 px-4 py-3 text-sm text-[var(--color-accent-red)]">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading || !formData.email}
              className="h-9 w-full rounded-[8px] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-on)] transition hover:bg-[var(--color-body)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send reset code"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setMode("signin")}
            className="mt-4 text-sm text-[var(--color-charcoal)] transition hover:text-[var(--color-ink)]"
          >
            Back to sign in
          </button>
        </AuthCard>
      </PageShell>
    );
  }

  if (mode === "reset-code") {
    return (
      <PageShell>
        <AuthCard compact>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-blue)]/10 text-lg text-[var(--color-accent-blue)]">
            ✉
          </div>
          <h1 className="text-xl font-medium text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
            Reset code sent
          </h1>
          <p className="mt-2 text-sm text-[var(--color-body)]">
            Enter the code from your email and your new password.
          </p>

          <form onSubmit={onResetPassword} className="mt-6 space-y-4 text-left">
            <input
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className="h-10 w-full rounded-[8px] border border-[var(--color-hairline-strong)] bg-[var(--color-surface-card)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-stone)] focus:border-[var(--color-ink)]"
              required
            />
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="h-10 w-full rounded-[8px] border border-[var(--color-hairline-strong)] bg-[var(--color-surface-card)] px-3.5 py-2.5 text-center text-2xl tracking-[0.5em] text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-stone)] focus:border-[var(--color-ink)]"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="New password"
              value={formData.password}
              onChange={onInputChange}
              className="h-10 w-full rounded-[8px] border border-[var(--color-hairline-strong)] bg-[var(--color-surface-card)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-stone)] focus:border-[var(--color-ink)]"
              required
              minLength={6}
            />

            {error ? (
              <p className="rounded-[8px] border border-[var(--color-accent-red)]/20 bg-[var(--color-accent-red)]/10 px-4 py-3 text-sm text-[var(--color-accent-red)]">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading || !formData.email || verificationCode.length < 6 || !formData.password}
              className="h-9 w-full rounded-[8px] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-on)] transition hover:bg-[var(--color-body)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset password"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setMode("signin")}
            className="mt-4 text-sm text-[var(--color-charcoal)] transition hover:text-[var(--color-ink)]"
          >
            Back to sign in
          </button>
        </AuthCard>
      </PageShell>
    );
  }

  if (mode === "password-reset") {
    return (
      <PageShell>
        <AuthCard compact>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-green)]/10 text-lg text-[var(--color-accent-green)]">
            ✓
          </div>
          <h1 className="text-xl font-medium text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
            Password reset!
          </h1>
          <p className="mt-2 text-sm text-[var(--color-body)]">{status}</p>
          <button
            type="button"
            onClick={() => setMode("signin")}
            className="mt-6 h-9 w-full rounded-[8px] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-on)] transition hover:bg-[var(--color-body)]"
          >
            Go to sign in
          </button>
        </AuthCard>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <AuthForm
        mode={mode}
        formData={formData}
        onInputChange={onInputChange}
        onSubmit={onSubmit}
        onModeChange={setMode}
        loading={loading}
        error={error}
        status={status}
      />
    </PageShell>
  );
}
