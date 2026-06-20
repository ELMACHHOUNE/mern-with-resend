import { Navigate, Route, Routes } from "react-router-dom";
import AuthPage from "./pages/auth/AuthPage";
import HomePage from "./pages/home/HomePage";

const hasToken = () => Boolean(localStorage.getItem("auth_token"));

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={hasToken() ? "/home" : "/auth"} replace />}
      />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route
        path="*"
        element={<Navigate to={hasToken() ? "/home" : "/auth"} replace />}
      />
    </Routes>
  );
}
