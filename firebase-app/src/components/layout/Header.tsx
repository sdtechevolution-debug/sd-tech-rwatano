import React, { useState } from "react";
import { LogOut, Menu, ChevronDown, Bell, User, Moon, Sun } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const theme = document.documentElement.classList.contains("dark") ? "dark" : "light";

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setOpen(false);
  };

  return (
    <header className="relative z-20 overflow-visible flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:px-6">
      <div className="flex items-center gap-3">
        <Menu className="h-6 w-6 text-slate-600 dark:text-slate-300" />
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{user?.email || "User"}</p>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          aria-label="Open account menu"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-white">
            {user?.email?.[0]?.toUpperCase() || "U"}
          </div>
          <ChevronDown className="h-4 w-4" />
        </button>

        {open && (
          <div className="absolute right-0 z-[9999] mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="p-3 text-sm text-slate-700 dark:text-slate-200">
              <div className="mb-3 flex items-center gap-3">
                <User className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Signed in as</p>
                  <p className="font-semibold">{user?.email || "User"}</p>
                </div>
              </div>
              <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
                <Bell className="h-4 w-4 text-amber-500" />
                Notifications
              </button>
              <button
                onClick={toggleTheme}
                className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {theme === "dark" ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-slate-600" />}
                Toggle theme
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="mt-3 flex w-full items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-400"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
