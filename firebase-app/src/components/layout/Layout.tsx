import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header />
      <div className="flex flex-1 min-h-[calc(100vh-72px)] flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <footer className="border-t border-slate-200/80 bg-white/70 px-4 py-3 text-sm text-slate-600 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80 dark:text-slate-400">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} SD TECH Rwatano</span>
          <span>Firebase app dashboard & resource center.</span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
