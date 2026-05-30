import React, { useState } from "react";
import SearchableSelect from "../../components/ui/SearchableSelect";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, Bell, ChevronDown, User, LogOut, Menu } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import Logo from "./Logo";

type HeaderProps = {
  user: { name: string; role: string } | null;
  onLogout: () => void;
  theme: string;
  setTheme: (theme: string) => void;
  onToggleMenu?: () => void;
  sidebarCollapsed?: boolean;
};

const Header = ({ user, onLogout, theme, setTheme, onToggleMenu, sidebarCollapsed = false }: HeaderProps) => {
  const [open, setOpen] = useState(false);
  const { language, setLanguage, t, options } = useLanguage();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    setOpen(false);
  };
  const navigate = useNavigate();

  return (
    <header className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
      theme === "dark" ? "text-slate-100" : "text-slate-900"
    }`}>
      <div className={`relative flex items-center justify-between gap-4 px-4 md:px-6 h-[88px] ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} ${
        theme === "dark"
          ? "bg-slate-950 border-b border-slate-800"
          : "bg-gradient-to-r from-slate-50 via-white to-slate-100 border-b border-slate-200"
      }`}>
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => onToggleMenu && onToggleMenu()}
            className={`mr-2 inline-flex h-11 w-11 items-center justify-center rounded-2xl text-sm transition duration-200 md:hidden ${theme === 'dark' ? 'text-slate-200 bg-slate-900/70 hover:bg-slate-800/90' : 'text-slate-700 bg-slate-100 hover:bg-slate-200'}`}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          {/* Logo moved to sidebar for consistent nav branding */}
          <div className="min-w-0">
            {/* keep header title centered; logo appears in sidebar */}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center min-w-0">
          <h1 className={`truncate text-base md:text-xl font-semibold ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>
            {t("welcomeBack", { name: user?.name || "Manager" })}
          </h1>
        </div>

        <div className="relative">
        <button
          onClick={() => setOpen((s) => !s)}
          className={`inline-flex items-center gap-3 rounded-2xl border px-3 py-2 text-sm font-medium shadow-sm transition-all duration-200 min-w-0 flex-shrink-0 ${
            theme === "dark"
              ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
              : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
          }`}
          aria-label="Account menu"
          aria-expanded={open}
          aria-controls="account-menu"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-3xl bg-amber-500 text-white text-base font-bold shadow-sm">
            {user?.name?.[0] || "U"}
          </div>
          <div className="hidden sm:flex flex-col text-left min-w-0">
            <div className="text-xs text-slate-400">{t("signedInAs")}</div>
            <div className="text-sm font-semibold text-amber-500 truncate">{user?.role || t("staff")}</div>
          </div>
          <ChevronDown className={`hidden sm:inline-block h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"} ${theme === "dark" ? "text-slate-300" : "text-slate-500"}`} />
        </button>

        {open && (
          <div id="account-menu" className={`absolute right-0 mt-2 w-60 rounded-3xl border shadow-lg ring-1 transition duration-200 z-[9999] ${
            theme === "dark" ? "border-slate-800 bg-slate-950 text-slate-100 ring-slate-700" : "border-slate-200 bg-white text-slate-900 ring-slate-200"
          }`}>
            <div className="space-y-2 p-3">
              <button
                onClick={toggleTheme}
                className={`flex w-full items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition duration-200 ${
                  theme === "dark" ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800" : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                }`}
              >
                {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-500" />}
                <span className="flex-1 text-left">{t("toggleTheme")}</span>
              </button>

              <button className={`flex w-full items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition duration-200 ${
                theme === "dark" ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800" : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
              }`}>
                <Bell className="h-4 w-4 text-amber-400" />
                <span className="flex-1 text-left">{t("alerts")}</span>
              </button>

              <div className={`rounded-3xl border px-3 py-3 ${theme === "dark" ? "border-slate-700 bg-slate-900 text-slate-100" : "border-slate-200 bg-slate-50 text-slate-900"}`}>
                <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-500">{t("language")}</label>
                <SearchableSelect
                  options={options.map(o => ({ value: o.code, label: o.label }))}
                  value={language}
                  onChange={(v) => setLanguage(v as "en" | "rw")}
                  className="w-full"
                />
              </div>

              <div className={`rounded-3xl px-3 py-3 text-sm ${theme === "dark" ? "bg-slate-900 text-slate-300" : "bg-slate-50 text-slate-600"}`}>
                <div className="text-xs">{user?.name || "User"}</div>
                <div className="font-semibold text-amber-500">{user?.role || "Staff"}</div>
              </div>

              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/profile");
                }}
                className={`flex w-full items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition duration-200 ${
                  theme === "dark" ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800" : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                }`}
              >
                <User className="h-4 w-4 text-amber-400" />
                <span className="flex-1 text-left">{t("profile")}</span>
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-600 px-3 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-amber-500"
              >
                <LogOut className="h-4 w-4" />
                <span>{t("logout")}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </header>
  );
};

export default Header;
