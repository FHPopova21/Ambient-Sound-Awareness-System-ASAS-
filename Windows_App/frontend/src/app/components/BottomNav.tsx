import { Link, useLocation } from "react-router";
import { Home, History, Settings, Activity } from "lucide-react";
import { motion } from "motion/react";

export function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { path: "/", icon: Home, label: "Начало" },
    { path: "/simulation", icon: Activity, label: "Симулация" },
    { path: "/history", icon: History, label: "История" },
    { path: "/settings", icon: Settings, label: "Настройки" },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4">
      <nav className="flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-2 py-2 backdrop-blur-xl shadow-lg ring-1 ring-black/5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex h-12 w-12 flex-col items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-white/20"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-white/40 shadow-sm"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon
                size={24}
                className={`relative z-10 transition-colors ${
                  isActive ? "text-slate-900" : "text-slate-600"
                }`}
              />
              <span className="sr-only">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
