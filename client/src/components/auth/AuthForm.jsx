export default function AuthForm({
  mode,
  formData,
  onInputChange,
  onSubmit,
  onModeChange,
  loading,
  error,
  status,
}) {
  const isSignup = mode === "signup";

  return (
    <div className="rounded-[12px] border border-[var(--color-hairline-strong)] bg-[var(--color-surface-card)] p-8">
      <div className="mb-2 inline-flex rounded-full border border-[var(--color-hairline)] bg-[var(--color-surface-elevated)] px-3 py-1 text-xs text-[var(--color-charcoal)]">
        {isSignup ? "Get started" : "Welcome back"}
      </div>

      <h1
        className="mt-4 text-[clamp(2rem,5vw,2.5rem)] font-medium leading-none tracking-tight text-[var(--color-ink)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {isSignup ? "Create your account" : "Sign in"}
      </h1>

      <p className="mt-2 text-sm text-[var(--color-body)]">
        {isSignup
          ? "Enter your details to get started."
          : "Enter your credentials to continue."}
      </p>

      <div className="mb-6 mt-6 flex gap-1 rounded-[8px] bg-[var(--color-surface-elevated)] p-1">
        <button
          type="button"
          onClick={() => onModeChange("signin")}
          className={`flex-1 rounded-[6px] px-4 py-2 text-sm font-medium transition ${
            !isSignup
              ? "bg-[var(--color-surface-card)] text-[var(--color-ink)]"
              : "text-[var(--color-charcoal)]"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => onModeChange("signup")}
          className={`flex-1 rounded-[6px] px-4 py-2 text-sm font-medium transition ${
            isSignup
              ? "bg-[var(--color-surface-card)] text-[var(--color-ink)]"
              : "text-[var(--color-charcoal)]"
          }`}
        >
          Sign up
        </button>
      </div>

      {status ? (
        <p className="mb-4 rounded-[8px] bg-[var(--color-surface-elevated)] px-4 py-3 text-sm text-[var(--color-charcoal)]">
          {status}
        </p>
      ) : null}

      {error ? (
        <p className="mb-4 rounded-[8px] border border-[var(--color-accent-red)]/20 bg-[var(--color-accent-red)]/10 px-4 py-3 text-sm text-[var(--color-accent-red)]">
          {error}
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4">
        {isSignup && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-charcoal)]">
              Username
            </label>
            <input
              type="text"
              name="name"
              placeholder="john doe"
              value={formData.name}
              onChange={onInputChange}
              className="h-10 w-full rounded-[8px] border border-[var(--color-hairline-strong)] bg-[var(--color-surface-card)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-stone)] focus:border-[var(--color-ink)]"
              required
            />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--color-charcoal)]">
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="john.doe@gmail.com"
            value={formData.email}
            onChange={onInputChange}
            className="h-10 w-full rounded-[8px] border border-[var(--color-hairline-strong)] bg-[var(--color-surface-card)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-stone)] focus:border-[var(--color-ink)]"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--color-charcoal)]">
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={onInputChange}
            className="h-10 w-full rounded-[8px] border border-[var(--color-hairline-strong)] bg-[var(--color-surface-card)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-stone)] focus:border-[var(--color-ink)]"
            required
            minLength={6}
          />
        </div>

        {isSignup && (
          <label className="flex items-start gap-3 text-sm text-[var(--color-charcoal)]">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-[var(--color-hairline-strong)] bg-[var(--color-surface-card)] text-[var(--color-ink)]"
              required
            />
            <span>
              I agree to the privacy policy & terms.
            </span>
          </label>
        )}

        <button
          type="submit"
          disabled={loading}
          className="h-9 w-full rounded-[8px] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-on)] transition hover:bg-[var(--color-body)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Please wait..." : isSignup ? "Sign up" : "Sign in"}
        </button>

        {!isSignup && (
          <button
            type="button"
            onClick={() => onModeChange("forgot-password")}
            className="mt-1 w-full text-center text-sm text-[var(--color-charcoal)] transition hover:text-[var(--color-link)]"
          >
            Forgot password?
          </button>
        )}
      </form>

      <div className="mt-6 text-center text-sm text-[var(--color-charcoal)]">
        {isSignup ? "Already have an account?" : "Need an account?"}{" "}
        <button
          type="button"
          onClick={() => onModeChange(isSignup ? "signin" : "signup")}
          className="font-medium text-[var(--color-link)] transition hover:text-[var(--color-accent-blue)]"
        >
          {isSignup ? "Sign in instead" : "Create one"}
        </button>
      </div>
    </div>
  );
}
