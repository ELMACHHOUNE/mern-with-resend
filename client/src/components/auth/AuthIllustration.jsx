function MetricCard({ title, subtitle, value, accent = "indigo" }) {
  const accentClasses = {
    indigo: "from-indigo-500 to-violet-500",
    emerald: "from-emerald-400 to-teal-500",
    rose: "from-rose-400 to-pink-500",
  };

  return (
    <div className="absolute rounded-2xl border border-white/70 bg-white/90 p-4 shadow-[0_20px_60px_rgba(99,102,241,0.14)] backdrop-blur-sm">
      <p className="text-xs font-medium text-slate-500">{title}</p>
      <p className="text-[11px] text-slate-400">{subtitle}</p>
      <div className="mt-3 flex items-end gap-2">
        <div
          className={`h-8 w-1.5 rounded-full bg-gradient-to-t ${accentClasses[accent]}`}
        />
        <div
          className={`h-5 w-1.5 rounded-full bg-gradient-to-t ${accentClasses[accent]}`}
        />
        <div
          className={`h-11 w-1.5 rounded-full bg-gradient-to-t ${accentClasses[accent]}`}
        />
        <div
          className={`h-7 w-1.5 rounded-full bg-gradient-to-t ${accentClasses[accent]}`}
        />
        <div
          className={`h-9 w-1.5 rounded-full bg-gradient-to-t ${accentClasses[accent]}`}
        />
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <span className="text-lg font-semibold text-slate-700">{value}</span>
        <span className="text-xs font-semibold text-emerald-500">+12.6%</span>
      </div>
    </div>
  );
}

export default function AuthIllustration() {
  return (
    <div className="relative min-h-[340px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-5 shadow-inner sm:min-h-[560px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.20),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(45,212,191,0.16),transparent_32%)]" />
      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200/70" />
      <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-100/80" />

      <div className="absolute left-8 top-24 sm:left-20 sm:top-20">
        <MetricCard
          title="Sessions"
          subtitle="This Month"
          value="45.1k"
          accent="indigo"
        />
      </div>
      <div className="absolute right-8 top-24 sm:right-24 sm:top-28">
        <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-[0_20px_60px_rgba(14,165,233,0.14)] backdrop-blur-sm">
          <p className="text-xs font-medium text-slate-500">Sales</p>
          <p className="text-[11px] text-slate-400">Last Year</p>
          <div className="mt-3 h-16 w-28 rounded-xl bg-gradient-to-br from-emerald-50 to-white p-2">
            <div className="flex h-full items-end gap-1">
              <div className="h-5 w-1/5 rounded-t-full bg-emerald-300" />
              <div className="h-9 w-1/5 rounded-t-full bg-emerald-400" />
              <div className="h-6 w-1/5 rounded-t-full bg-emerald-300" />
              <div className="h-12 w-1/5 rounded-t-full bg-emerald-500" />
              <div className="h-7 w-1/5 rounded-t-full bg-emerald-300" />
            </div>
          </div>
          <div className="mt-3 flex items-end justify-between gap-3">
            <span className="text-lg font-semibold text-slate-700">175k</span>
            <span className="text-xs font-semibold text-rose-400">-16.2%</span>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-12 flex items-end justify-center sm:bottom-14">
        <div className="relative">
          <div className="mx-auto h-24 w-64 rounded-[2.5rem] border-8 border-slate-800/10 bg-slate-200/90 shadow-[0_25px_60px_rgba(15,23,42,0.12)] sm:h-32 sm:w-96" />
          <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-[90%] rounded-full bg-slate-700 shadow-lg sm:h-16 sm:w-16" />
          <div className="absolute left-1/2 top-1/2 h-24 w-20 -translate-x-1/2 -translate-y-[10%] rounded-t-[2rem] rounded-b-3xl bg-gradient-to-b from-cyan-500 to-slate-700 shadow-lg sm:h-32 sm:w-24" />
          <div className="absolute left-1/2 top-[56%] h-18 w-20 -translate-x-1/2 rounded-t-[2rem] bg-slate-700 sm:h-24 sm:w-24" />
          <div className="absolute left-[45%] top-[70%] h-16 w-14 -translate-x-1/2 rounded-b-[2rem] bg-slate-600 sm:h-20 sm:w-16" />
          <div className="absolute left-[57%] top-[70%] h-16 w-14 -translate-x-1/2 rounded-b-[2rem] bg-slate-600 sm:h-20 sm:w-16" />
          <div className="absolute left-[50%] top-[88%] h-24 w-10 -translate-x-1/2 rounded-b-[2rem] bg-slate-800 sm:h-28 sm:w-12" />
          <div className="absolute left-[38%] top-[88%] h-20 w-8 -rotate-12 rounded-b-[2rem] bg-slate-800 sm:h-24 sm:w-10" />
          <div className="absolute left-[61%] top-[88%] h-20 w-8 rotate-12 rounded-b-[2rem] bg-slate-800 sm:h-24 sm:w-10" />
          <div className="absolute left-1/2 top-[48%] h-24 w-32 -translate-x-1/2 rounded-[1.8rem] border border-white/60 bg-white/50 shadow-inner backdrop-blur-sm sm:h-32 sm:w-44" />
          <div className="absolute left-[47%] top-[43%] h-4 w-8 -translate-x-1/2 rounded-full bg-slate-900/90 sm:h-5 sm:w-10" />
          <div className="absolute left-[53%] top-[43%] h-4 w-8 -translate-x-1/2 rounded-full bg-slate-900/90 sm:h-5 sm:w-10" />
          <div className="absolute left-1/2 top-[24%] h-8 w-8 -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_10px_25px_rgba(34,211,238,0.35)] sm:h-10 sm:w-10" />
        </div>
      </div>

      <div className="absolute bottom-8 left-5 right-5 rounded-full bg-white/70 px-4 py-2 text-center text-xs text-slate-500 shadow-sm backdrop-blur sm:left-10 sm:right-10">
        Manage users, sessions, and sign-ins with a clean MERN auth flow.
      </div>
    </div>
  );
}
