import { NavLink } from "react-router-dom";
import { Home, Box, ShoppingBag, Cpu, FileText, DollarSign, ClipboardList, StickyNote, X, type LucideIcon } from "lucide-react";
import MaximizeSvg from "../../assets/maximize.svg";
import { useLanguage, type TranslationKeys } from "../../context/LanguageContext";
import Logo from "./Logo";

type SidebarLink = {
  path: string;
  labelKey: TranslationKeys;
  icon: LucideIcon;
};

const links: SidebarLink[] = [
  { path: "/", labelKey: "dashboard", icon: Home },
  { path: "/products", labelKey: "inventory", icon: Box },
  { path: "/sales", labelKey: "sales", icon: ShoppingBag },
  { path: "/services", labelKey: "services", icon: Cpu },
  { path: "/expenses", labelKey: "expenses", icon: FileText },
  { path: "/debts", labelKey: "debts", icon: DollarSign },
  { path: "/reports", labelKey: "reports", icon: ClipboardList },
  { path: "/notes", labelKey: "notes", icon: StickyNote },
];
type SidebarProps = {
  theme: string;
  mobileOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

const Sidebar = ({ theme, mobileOpen = false, onClose, collapsed = false, onToggleCollapse }: SidebarProps) => {
  const { t } = useLanguage();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden md:flex md:flex-col md:fixed md:top-0 md:bottom-0 md:left-0 z-50 group relative pt-0 pb-4 px-2 md:px-4 gap-6 transition-all duration-300 ease-in-out ${collapsed ? 'md:w-20' : 'md:w-64'} ${
        theme === "dark"
          ? "border-r border-slate-800 bg-slate-950"
          : "border-r border-slate-200 bg-slate-50"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="mb-2">
              <Logo compact={collapsed} className="px-0" />
            </div>
          </div>
        </div>

        {/* maximize control centered on right border of the nav */}
        <button
          onClick={onToggleCollapse}
          aria-label="Toggle sidebar"
          title={collapsed ? "Expand" : "Collapse"}
          className={`hidden md:inline-flex items-center justify-center rounded-md p-2 bg-amber-500 text-white shadow-lg border border-white/10 absolute md:-right-3 top-1/2 -translate-y-1/2 z-50 transform transition-all duration-200 md:opacity-0 md:group-hover:opacity-100 hover:scale-105`}
        >
          <img src={MaximizeSvg} alt="maximize" className="h-5 w-5" />
        </button>
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center ${collapsed ? 'justify-center' : 'gap-3'} rounded-2xl px-4 py-3 text-sm font-medium transition duration-200 ${
                    isActive
                      ? theme === "dark"
                        ? "bg-slate-800 text-amber-300"
                        : "bg-amber-100 text-amber-700"
                      : theme === "dark"
                      ? "text-slate-300 hover:bg-slate-900 hover:text-slate-100"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="truncate text-sm font-medium">{t(link.labelKey)}</span>}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <button className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close menu" />
          <aside className={`relative z-50 w-72 max-w-[85%] h-full flex flex-col border-r p-4 ${theme === "dark" ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"} shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
              <Logo compact />
              <button onClick={onClose} className="rounded-md p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink key={link.path} to={link.path} onClick={onClose} className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition duration-200 ${
                      isActive
                        ? theme === "dark"
                          ? "bg-slate-800 text-amber-300"
                          : "bg-amber-100 text-amber-700"
                        : theme === "dark"
                        ? "text-slate-300 hover:bg-slate-900 hover:text-slate-100"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }>
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate text-sm font-medium">{t(link.labelKey)}</span>
                  </NavLink>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
