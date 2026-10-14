import { Navigate } from "react-router-dom";

// A browser-stored profile is not proof of a logged-in session.
// MainLayout verifies this token with Flask /me before rendering any pages.
function ProtectedRoute({ children }) {
  if (!sessionStorage.getItem("lama_token")) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default ProtectedRoute;
