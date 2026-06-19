import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../../api/auth";

const TOKEN_KEY = "auth_token";

function StatCard({ label, value, delta }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.24em] text-white/45">
        {label}
      </p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <span className="text-3xl font-semibold text-white">{value}</span>
        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          {delta}
        </span>
      </div>
    </div>
  );
}

function MiniCard({
  title,
  subtitle,
  accent = "from-fuchsia-500 to-violet-500",
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/90 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-sm">
      <div className={`h-2 w-16 rounded-full bg-linear-to-r ${accent}`} />
      <p className="mt-4 text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs text-white/55">{subtitle}</p>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem(TOKEN_KEY);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Loading home...");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/auth", { replace: true });
      return;
    }

    let isMounted = true;

    const loadUser = async () => {
      try {
        const data = await getCurrentUser(token);
        if (!isMounted) {
          return;
        }
        setUser(data.user);
        setStatus("Welcome back");
      } catch (err) {
        localStorage.removeItem(TOKEN_KEY);
        if (!isMounted) {
          return;
        }
        setError(err.message || "Session expired");
        navigate("/auth", { replace: true });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [navigate, token]);

  const greeting = useMemo(() => {
    if (!user) {
      return "";
    }
    return `Hi, ${user.name}`;
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore network failures on logout
    }

    localStorage.removeItem(TOKEN_KEY);
    navigate("/auth", { replace: true });
  };

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#13112b] text-white">
      <div className="mx-auto flex min-h-screen max-w-400 flex-col px-4 pb-6 pt-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 rounded-full border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#13112b] shadow-lg">
              <span className="text-lg font-black">J</span>
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide">Justis</p>
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">
                Design system
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
            <a href="#courses" className="transition hover:text-white">
              Courses
            </a>
            <a href="#about" className="transition hover:text-white">
              About Us
            </a>
            <a href="#blog" className="transition hover:text-white">
              Blog
            </a>
            <a href="#projects" className="transition hover:text-white">
              Projects
            </a>
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white/90 transition hover:bg-white hover:text-[#13112b]"
          >
            Logout
          </button>
        </header>

        <section className="relative mt-6 flex flex-1 flex-col overflow-hidden rounded-4xl border border-white/10 bg-[#191636] shadow-[0_50px_120px_rgba(0,0,0,0.35)]">
          <div className="absolute inset-0 opacity-70">
            <div className="absolute left-1/2 top-0 h-full w-[28%] -translate-x-1/2 bg-[linear-gradient(180deg,rgba(165,180,252,0.95)_0%,rgba(232,121,249,0.92)_28%,rgba(251,146,60,0.82)_62%,rgba(253,224,71,0.92)_100%)] blur-[0.5px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_30%),linear-gradient(to_right,transparent_0%,rgba(255,255,255,0.04)_50%,transparent_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[120px_120px] opacity-30" />
          </div>

          <div className="relative flex flex-1 flex-col justify-between px-4 py-8 sm:px-8 lg:px-14 lg:py-10">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/55">
                <span className="h-2 w-2 rounded-full bg-fuchsia-300 shadow-[0_0_18px_rgba(232,121,249,0.8)]" />
                {status}
              </div>

              <div className="relative w-full max-w-6xl">
                <p className="select-none text-[clamp(3.6rem,13vw,9rem)] font-black uppercase leading-none tracking-[-0.08em] text-white/95 sm:text-[clamp(4.5rem,12vw,10rem)]">
                  Design
                </p>
                <p className="select-none text-[clamp(3.6rem,13vw,9rem)] font-black uppercase leading-none tracking-[-0.08em] text-white/65 sm:text-[clamp(4.5rem,12vw,10rem)]">
                  System
                </p>

                <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-white/5 p-5 backdrop-blur-sm lg:block">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 text-2xl text-white">
                    ◦
                  </div>
                </div>
              </div>

              <p className="mt-3 max-w-xl text-sm tracking-[0.28em] text-white/70 sm:text-base">
                Design systems for enterprises
              </p>

              {error ? (
                <p className="mt-4 rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm text-rose-200">
                  {error}
                </p>
              ) : null}

              <button
                type="button"
                className="mt-10 rounded-full bg-white px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-[#191636] shadow-[0_22px_60px_rgba(255,255,255,0.18)] transition hover:-translate-y-px hover:bg-fuchsia-50"
                disabled={loading}
              >
                Let&apos;s start
              </button>
            </div>

            <div className="mt-12 grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
              <div className="grid gap-4 sm:grid-cols-2">
                <MiniCard
                  title="Product"
                  subtitle="Motion, typography, and color tokens"
                  accent="from-amber-300 to-fuchsia-400"
                />
                <MiniCard
                  title="Components"
                  subtitle="Cards, buttons, forms, and layouts"
                  accent="from-cyan-300 to-indigo-500"
                />
              </div>

              <div className="mx-auto hidden h-40 w-40 items-center justify-center rounded-full border border-white/10 bg-white/5 text-center text-sm text-white/70 shadow-[0_20px_80px_rgba(0,0,0,0.3)] lg:flex">
                <div>
                  <p className="text-4xl font-black text-white">#1</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.3em] text-white/45">
                    Design
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:justify-self-end">
                <MiniCard
                  title={greeting || "Welcome"}
                  subtitle={user ? user.email : "Signed in user"}
                  accent="from-violet-400 to-fuchsia-500"
                />
                <MiniCard
                  title="Team"
                  subtitle="1,000+ designers are already working with us"
                  accent="from-emerald-300 to-cyan-400"
                />
              </div>
            </div>

            <div className="mt-10 rounded-[28px] border border-white/10 bg-white/95 p-6 text-[#13112b] shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-fuchsia-500">
                    The ultimate library
                  </p>
                  <h2 className="mt-3 text-3xl font-black leading-tight text-[#1c1b38] sm:text-4xl">
                    Build elegant auth and landing pages with the same design
                    language.
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                    This home page mirrors the visual feel of your reference:
                    dark canvas, bold hero typography, floating information
                    cards, and a premium product landing layout.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <div className="rounded-3xl bg-[#191636] p-5 text-white shadow-lg">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                      Sections
                    </p>
                    <p className="mt-3 text-3xl font-black">04</p>
                    <p className="mt-2 text-sm text-white/70">
                      Home, auth, routing, dashboard.
                    </p>
                  </div>
                  <div className="rounded-3xl bg-linear-to-br from-violet-500 to-fuchsia-400 p-5 text-white shadow-lg">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/80">
                      Status
                    </p>
                    <p className="mt-3 text-3xl font-black">Live</p>
                    <p className="mt-2 text-sm text-white/80">
                      Connected to your MERN auth API.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
