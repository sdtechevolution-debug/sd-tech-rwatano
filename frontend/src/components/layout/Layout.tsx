import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useState } from "react";

const Layout = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      <Header user={user} onLogout={handleLogout} theme={theme} setTheme={setTheme} onToggleMenu={() => setMobileSidebarOpen((s) => !s)} sidebarCollapsed={sidebarCollapsed} />
      <div className={`flex flex-1 overflow-hidden px-4 pb-4 md:px-6`}>
        <Sidebar theme={theme} mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed((s)=>!s)} />
        <main className={`flex-1 overflow-y-auto p-6 md:p-10 mx-auto w-full max-w-[1800px] transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} mt-[96px] ${
          theme === "dark"
            ? "border border-slate-800/70 bg-slate-950"
            : "border border-slate-200/70 bg-white"
        }`}>
          <Outlet />
        </main>
      </div>
      <footer className="relative z-60 border-t border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800/80 dark:bg-slate-950 dark:text-slate-400">
        <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} SD TECH Rwatano</span>
          <span>Built for small business finance and inventory management.</span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
