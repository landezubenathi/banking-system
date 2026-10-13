import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const user = sessionStorage.getItem("user");
  const token = sessionStorage.getItem("lama_token");
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default ProtectedRoute;
