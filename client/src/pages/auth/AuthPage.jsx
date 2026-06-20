import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../../components/auth/AuthForm";
import AuthIllustration from "../../components/auth/AuthIllustration";
import { getCurrentUser, logout, signin, signup, verifyEmail } from "../../api/auth";

const TOKEN_KEY = "auth_token";

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin");
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [verificationCode, setVerificationCode] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }

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
    if (!user) {
      return null;
    }

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
        setFormData({ name: "", email: "", password: "" });
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
      setStatus("Ready");
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
      setStatus("Ready");
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
      <main className="min-h-screen bg-linear-to-br from-slate-100 via-white to-indigo-100 p-4 sm:p-6">
        <section className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl items-center gap-6 rounded-4xl border border-white/70 bg-white/80 p-4 shadow-[0_30px_90px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:min-h-[calc(100vh-3rem)] sm:grid-cols-[1.1fr_0.9fr] sm:p-6">
          <AuthIllustration />

          <div className="rounded-4xl bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.12)] sm:p-8">
            <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
              Authenticated
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">
              {greeting.title}
            </h1>
            <p className="mt-2 text-sm text-slate-500">{greeting.subtitle}</p>

            <div className="mt-8 rounded-3xl border border-slate-100 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-700">Current user</p>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>
                  <span className="font-medium text-slate-900">Name:</span>{" "}
                  {user.name}
                </p>
                <p>
                  <span className="font-medium text-slate-900">Email:</span>{" "}
                  {user.email}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Logging out..." : "Logout"}
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (mode === "verification-sent" || mode === "verified") {
    return (
      <main className="min-h-screen bg-linear-to-br from-slate-100 via-white to-indigo-100 p-4 sm:p-6">
        <section className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl gap-6 rounded-4xl border border-white/70 bg-white/80 p-4 shadow-[0_30px_90px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:min-h-[calc(100vh-3rem)] sm:grid-cols-[1.1fr_0.9fr] sm:p-6">
          <AuthIllustration />

          <div className="rounded-[2rem] bg-white p-6 text-center shadow-[0_30px_90px_rgba(15,23,42,0.12)] sm:p-8">
            {mode === "verified" ? (
              <>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600">
                  ✓
                </div>
                <h1 className="text-xl font-semibold text-slate-900">Email verified!</h1>
                <p className="mt-2 text-sm text-slate-500">{status}</p>
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="mt-6 w-full rounded-2xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                  Go to sign in
                </button>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-2xl text-indigo-600">
                  ✉
                </div>
                <h1 className="text-xl font-semibold text-slate-900">
                  Check your email
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  We sent a 6-digit code to <strong>{formData.email}</strong>.
                  Enter it below to activate your account.
                </p>

                <form onSubmit={onVerifyCode} className="mt-6 space-y-4">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-2xl tracking-[8px] text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-indigo-300 focus:bg-white"
                    required
                  />

                  {error ? (
                    <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                      {error}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={loading || verificationCode.length < 6}
                    className="w-full rounded-2xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(79,70,229,0.22)] transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "Verifying..." : "Verify email"}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="mt-4 text-sm text-slate-500 hover:text-indigo-600"
                >
                  Back to sign in
                </button>
              </>
            )}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-100 via-white to-indigo-100 p-4 sm:p-6">
      <section className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl gap-6 rounded-4xl border border-white/70 bg-white/80 p-4 shadow-[0_30px_90px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:min-h-[calc(100vh-3rem)] sm:grid-cols-[1.1fr_0.9fr] sm:p-6">
        <AuthIllustration />

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
      </section>
    </main>
  );
}
