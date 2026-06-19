import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../../components/auth/AuthForm";
import AuthIllustration from "../../components/auth/AuthIllustration";
import { getCurrentUser, logout, signin, signup } from "../../api/auth";

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

      const data =
        mode === "signup"
          ? await signup({ ...payload, name: formData.name })
          : await signin(payload);

      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      setStatus(data.message);
      setFormData({ name: "", email: "", password: "" });
      navigate("/home", { replace: true });
    } catch (err) {
      setError(err.message || "Authentication failed");
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
