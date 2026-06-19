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
    <div className="rounded-[2rem] bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.12)] sm:p-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 shadow-sm">
            <span className="text-xl font-bold">◆</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {isSignup
              ? "Sign up to get started with your MERN app."
              : "Sign in to continue to your dashboard."}
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => onModeChange("signin")}
          className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            !isSignup ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => onModeChange("signup")}
          className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            isSignup ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
          }`}
        >
          Sign up
        </button>
      </div>

      {status ? (
        <p className="mb-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {status}
        </p>
      ) : null}

      {error ? (
        <p className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4">
        {isSignup && (
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              type="text"
              name="name"
              placeholder="john doe"
              value={formData.name}
              onChange={onInputChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white"
              required
            />
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="john.doe@gmail.com"
            value={formData.email}
            onChange={onInputChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={onInputChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white"
            required
            minLength={6}
          />
        </div>

        {isSignup && (
          <label className="flex items-start gap-3 text-sm text-slate-500">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              required
            />
            <span>
              I agree to the privacy policy & terms for this demo auth flow.
            </span>
          </label>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(79,70,229,0.22)] transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Please wait..." : isSignup ? "Sign up" : "Sign in"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500">
        {isSignup ? "Already have an account?" : "Need an account?"}{" "}
        <button
          type="button"
          onClick={() => onModeChange(isSignup ? "signin" : "signup")}
          className="font-semibold text-indigo-600 hover:text-indigo-500"
        >
          {isSignup ? "Sign in instead" : "Create one"}
        </button>
      </div>
    </div>
  );
}
