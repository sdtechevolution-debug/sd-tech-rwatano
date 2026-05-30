import { NavLink } from "react-router-dom";
import { Home, Box } from "lucide-react";

const links = [
  { path: "/", label: "Dashboard", icon: Home },
  { path: "/products", label: "Products", icon: Box },
];

const Sidebar = () => {
  return (
    <aside className="w-full border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:w-72 md:border-r md:border-t-0">
      <div className="mb-6 text-2xl font-semibold text-slate-900 dark:text-slate-100">Product Manager</div>
      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive ? "bg-brand-500 text-white" : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
