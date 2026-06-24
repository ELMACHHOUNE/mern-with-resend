import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../../api/auth";
import InboxLayout from "../../components/inbox/InboxLayout";

const TOKEN_KEY = "auth_token";

export default function InboxPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem(TOKEN_KEY);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/auth", { replace: true });
      return;
    }

    let mounted = true;
    getCurrentUser(token)
      .then((data) => {
        if (mounted) setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        if (mounted) navigate("/auth", { replace: true });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [navigate, token]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {}
    localStorage.removeItem(TOKEN_KEY);
    navigate("/auth", { replace: true });
  };

  if (!token || loading) return null;

  return (
    <main
      style={{ backgroundColor: "var(--color-canvas)" }}
      className="flex h-screen flex-col text-[var(--color-ink)]"
    >
      <header className="flex items-center justify-between border-b border-[var(--color-hairline)] bg-[var(--color-surface-card)] px-5 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--color-primary)] text-sm font-medium text-[var(--color-primary-on)]">
            E
          </div>
          <span className="text-sm font-semibold tracking-[-0.022em] text-[var(--color-ink)]">
            Email Pro
          </span>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-xs text-[var(--color-charcoal)]">
              {user.name}
            </span>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-[8px] border border-[var(--color-hairline)] bg-transparent px-3 py-1.5 text-xs text-[var(--color-charcoal)] transition hover:text-[var(--color-ink)]"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <InboxLayout />
      </div>
    </main>
  );
}
