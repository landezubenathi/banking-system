import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function MainLayout() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content">
        <Navbar user={user} />

        <Outlet />
      </div>
    </div>
  );
}

export default MainLayout;