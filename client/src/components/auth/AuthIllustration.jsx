export default function AuthIllustration() {
  return (
    <div className="relative min-h-[340px] overflow-hidden rounded-[18px] bg-[var(--color-surface-elevated)] sm:min-h-[560px]">
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="rounded-[18px] border border-[var(--color-hairline)] bg-[var(--color-surface-card)] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--color-primary)] text-sm font-medium text-[var(--color-primary-on)]">
                E
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-ink)]">
                  Email Pro
                </p>
                <p className="text-xs text-[var(--color-charcoal)]">
                  Manage your inbox
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="h-2 rounded-full" style={{ backgroundColor: "var(--color-hairline)" }} />
              <div className="h-2 w-3/4 rounded-full" style={{ backgroundColor: "var(--color-hairline)" }} />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--color-accent-green)" }} />
              <span className="text-xs" style={{ color: "var(--color-accent-green)" }}>
                All systems operational
              </span>
            </div>
          </div>

          <div className="rounded-[11px] border border-[var(--color-hairline)] bg-[var(--color-surface-card)] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface-elevated)] text-xs text-[var(--color-charcoal)]">
                JD
              </div>
              <div className="flex-1">
                <p className="text-sm text-[var(--color-ink)]">
                  Welcome to Email Pro
                </p>
                <p className="text-xs text-[var(--color-charcoal)]">
                  Your account is ready
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 rounded-[11px] bg-[var(--color-surface-card)] px-4 py-3 text-center text-xs text-[var(--color-charcoal)]">
        Secure email delivery powered by Resend
      </div>
    </div>
  );
}
