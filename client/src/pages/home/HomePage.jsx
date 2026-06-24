import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../../api/auth";

const TOKEN_KEY = "auth_token";

export default function HomePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem(TOKEN_KEY);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Dashboard");
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
        if (!isMounted) return;
        setUser(data.user);
        setStatus("Welcome back");
      } catch (err) {
        localStorage.removeItem(TOKEN_KEY);
        if (!isMounted) return;
        setError(err.message || "Session expired");
        navigate("/auth", { replace: true });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadUser();

    return () => { isMounted = false; };
  }, [navigate, token]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore
    }
    localStorage.removeItem(TOKEN_KEY);
    navigate("/auth", { replace: true });
  };

  if (!token) {
    return null;
  }

  return (
    <main style={{ backgroundColor: "var(--color-canvas)" }} className="min-h-screen text-[var(--color-ink)]">
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-6 pt-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 rounded-[9999px] border border-[var(--color-hairline)] bg-[var(--color-surface-card)] px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[var(--color-primary)] text-sm font-medium text-[var(--color-primary-on)]">
              E
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[-0.022em] text-[var(--color-ink)]">Email Pro</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-charcoal)]">
                Dashboard
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-[var(--color-charcoal)] md:flex">
            <span className="transition hover:text-[var(--color-ink)] cursor-pointer">Overview</span>
            <span className="transition hover:text-[var(--color-ink)] cursor-pointer">Analytics</span>
            <span className="transition hover:text-[var(--color-ink)] cursor-pointer">Settings</span>
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-[8px] border border-[var(--color-hairline)] bg-transparent px-4 py-2 text-sm text-[var(--color-charcoal)] transition hover:text-[var(--color-ink)]"
          >
            Logout
          </button>
        </header>

        <div className="relative mt-8 flex-1 overflow-hidden rounded-[18px] border border-[var(--color-hairline)] bg-[var(--color-surface-card)]">
          <div className="relative flex flex-col justify-between px-6 py-8 sm:px-10 lg:px-14 lg:py-10">
            <div className="flex flex-col items-center text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-[9999px] border border-[var(--color-hairline)] bg-[var(--color-surface-elevated)] px-3.5 py-1.5 text-xs uppercase tracking-[0.3em] text-[var(--color-charcoal)]">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--color-accent-green)" }} />
                {status}
              </div>

              <div className="relative w-full max-w-4xl">
                <p
                  className="select-none text-[clamp(2.5rem,10vw,6rem)] font-semibold leading-[1.07] tracking-[-0.005em] text-[var(--color-ink)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {user ? `Hi, ${user.name}` : "Dashboard"}
                </p>

                <p className="mt-3 max-w-xl text-[17px] leading-[1.47] tracking-[-0.022em] text-[var(--color-charcoal)]">
                  Manage your email infrastructure
                </p>

                {error ? (
                  <p className="mt-4 inline-block rounded-[9999px] border border-[var(--color-accent-red)]/20 bg-[var(--color-accent-red)]/10 px-4 py-2 text-sm text-[var(--color-accent-red)]">
                    {error}
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={() => navigate("/inbox")}
                  className="mt-8 rounded-[9999px] bg-[var(--color-primary)] px-[22px] py-[11px] text-[17px] leading-none text-[var(--color-primary-on)] transition active:scale-[0.95] hover:opacity-90"
                >
                  Go to Inbox
                </button>
              </div>
            </div>

            <div className="mt-12 grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[18px] border border-[var(--color-hairline)] bg-[var(--color-surface-elevated)] p-5">
                  <div className="h-1.5 w-12 rounded-full" style={{ backgroundColor: "var(--color-accent-orange)" }} />
                  <p className="mt-4 text-sm font-semibold tracking-[-0.022em] text-[var(--color-ink)]">Email Delivery</p>
                  <p className="mt-1 text-xs text-[var(--color-charcoal)]">99.9% deliverability rate</p>
                </div>
                <div className="rounded-[18px] border border-[var(--color-hairline)] bg-[var(--color-surface-elevated)] p-5">
                  <div className="h-1.5 w-12 rounded-full" style={{ backgroundColor: "var(--color-primary)" }} />
                  <p className="mt-4 text-sm font-semibold tracking-[-0.022em] text-[var(--color-ink)]">Analytics</p>
                  <p className="mt-1 text-xs text-[var(--color-charcoal)]">Real-time tracking and insights</p>
                </div>
              </div>

              <div className="mx-auto hidden h-32 w-32 items-center justify-center rounded-full border border-[var(--color-hairline)] bg-[var(--color-surface-elevated)] text-center text-sm text-[var(--color-charcoal)] lg:flex">
                <div>
                  <p className="text-3xl font-semibold tracking-[-0.022em] text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
                    #1
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-[var(--color-charcoal)]">
                    Rated
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:justify-self-end">
                <div className="rounded-[18px] border border-[var(--color-hairline)] bg-[var(--color-surface-elevated)] p-5">
                  <div className="h-1.5 w-12 rounded-full" style={{ backgroundColor: "var(--color-accent-green)" }} />
                  <p className="mt-4 text-sm font-semibold tracking-[-0.022em] text-[var(--color-ink)]">{user?.name || "Welcome"}</p>
                  <p className="mt-1 text-xs text-[var(--color-charcoal)]">{user?.email || "Signed in user"}</p>
                </div>
                <div className="rounded-[18px] border border-[var(--color-hairline)] bg-[var(--color-surface-elevated)] p-5">
                  <div className="h-1.5 w-12 rounded-full" style={{ backgroundColor: "var(--color-primary)" }} />
                  <p className="mt-4 text-sm font-semibold tracking-[-0.022em] text-[var(--color-ink)]">Team</p>
                  <p className="mt-1 text-xs text-[var(--color-charcoal)]">Collaborate with your team</p>
                </div>
              </div>
            </div>

            <div className="mt-10 rounded-[18px] border border-[var(--color-hairline)] bg-[var(--color-surface-elevated)] p-6">
              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em]" style={{ color: "var(--color-accent-orange)" }}>
                    Email platform
                  </p>
                  <h2
                    className="mt-3 text-2xl font-semibold leading-[1.1] tracking-[-0.022em] text-[var(--color-ink)] sm:text-3xl"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Send transactional emails with confidence.
                  </h2>
                  <p className="mt-4 max-w-2xl text-[17px] leading-[1.47] tracking-[-0.022em] text-[var(--color-charcoal)]">
                    Powered by Resend — reliable delivery, simple API, and real-time analytics for your application.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <div className="rounded-[18px] border border-[var(--color-hairline)] bg-[var(--color-surface-card)] p-5">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--color-charcoal)]">
                      Emails sent
                    </p>
                    <p className="mt-3 text-3xl font-semibold tracking-[-0.022em] text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
                      0
                    </p>
                    <p className="mt-2 text-sm text-[var(--color-charcoal)]">
                      Since last deployment
                    </p>
                  </div>
                  <div className="rounded-[18px] border border-[var(--color-hairline)] bg-[var(--color-primary)] p-5">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-white/70">
                      Status
                    </p>
                    <p className="mt-3 text-3xl font-semibold tracking-[-0.022em] text-white" style={{ fontFamily: "var(--font-display)" }}>
                      Live
                    </p>
                    <p className="mt-2 text-sm text-white/70">
                      Connected to your API
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
