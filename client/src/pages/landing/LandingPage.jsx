import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("auth_token"));

  return (
    <main className="flex min-h-screen flex-col bg-[var(--color-canvas)]">
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-hairline)] bg-[var(--color-surface-card)] px-4 py-1.5 text-xs text-[var(--color-charcoal)]">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--color-accent-green)" }} />
          Powered by Resend
        </div>

        <h1
          className="text-[clamp(3rem,8vw,56px)] font-semibold leading-[1.07] tracking-[-0.005em] text-[var(--color-ink)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Email Pro
        </h1>

        <p
          className="mt-4 max-w-lg text-[clamp(1.125rem,2.5vw,21px)] font-semibold leading-[1.19] tracking-[0.011em] text-[var(--color-ink)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Send, receive, and manage emails with Resend.
        </p>

        <p className="mt-3 max-w-md text-[17px] leading-[1.47] tracking-[-0.022em] text-[var(--color-charcoal)]">
          A modern email platform built for developers. Reliable delivery, real-time webhooks, and a beautiful inbox.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {isLoggedIn ? (
            <button
              type="button"
              onClick={() => navigate("/inbox")}
              className="rounded-[9999px] bg-[var(--color-primary)] px-[22px] py-[11px] text-[17px] leading-none text-[var(--color-primary-on)] transition active:scale-[0.95] hover:opacity-90"
            >
              Go to Inbox
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate("/auth")}
                className="rounded-[9999px] bg-[var(--color-primary)] px-[22px] py-[11px] text-[17px] leading-none text-[var(--color-primary-on)] transition active:scale-[0.95] hover:opacity-90"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => navigate("/auth?mode=signup")}
                className="rounded-[9999px] border border-[var(--color-primary)] bg-transparent px-[22px] py-[11px] text-[17px] leading-none text-[var(--color-primary)] transition active:scale-[0.95] hover:opacity-90"
              >
                Get started
              </button>
            </>
          )}
        </div>
      </div>

      <footer className="border-t border-[var(--color-hairline)] px-6 py-5 text-center text-[12px] leading-none tracking-[-0.01em] text-[var(--color-charcoal)]">
        Email Pro &mdash; Powered by Resend
      </footer>
    </main>
  );
}
