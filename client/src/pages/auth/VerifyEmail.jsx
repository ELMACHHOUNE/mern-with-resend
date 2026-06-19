import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyEmail } from "../../api/auth";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    const verify = async () => {
      try {
        const data = await verifyEmail(token);
        setStatus("success");
        setMessage(data.message);
      } catch (err) {
        setStatus("error");
        setMessage(err.message || "Verification failed");
      }
    };

    verify();
  }, [searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-100 via-white to-indigo-100 p-4">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-[0_30px_90px_rgba(15,23,42,0.12)] text-center">
        {status === "verifying" && (
          <>
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            <h1 className="text-xl font-semibold text-slate-900">
              Verifying your email...
            </h1>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600">
              ✓
            </div>
            <h1 className="text-xl font-semibold text-slate-900">
              Email verified!
            </h1>
            <p className="mt-2 text-sm text-slate-500">{message}</p>
            <Link
              to="/auth"
              className="mt-6 inline-block w-full rounded-2xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Sign in
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-2xl text-rose-600">
              ✕
            </div>
            <h1 className="text-xl font-semibold text-slate-900">
              Verification failed
            </h1>
            <p className="mt-2 text-sm text-slate-500">{message}</p>
            <Link
              to="/auth"
              className="mt-6 inline-block w-full rounded-2xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
