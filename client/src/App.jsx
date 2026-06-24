import { Navigate, Route, Routes } from "react-router-dom";
import AuthPage from "./pages/auth/AuthPage";
import HomePage from "./pages/home/HomePage";
import InboxPage from "./pages/inbox/InboxPage";

const hasToken = () => Boolean(localStorage.getItem("auth_token"));

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={hasToken() ? "/inbox" : "/auth"} replace />}
      />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/inbox" element={<InboxPage />} />
      <Route
        path="*"
        element={<Navigate to={hasToken() ? "/inbox" : "/auth"} replace />}
      />
    </Routes>
  );
}
