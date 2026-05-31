import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {

  const admin = localStorage.getItem("admin");

  if (admin !== "true") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}