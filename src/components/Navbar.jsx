import React, { useRef, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Sun, Moon, Monitor, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function ThemeDropdown() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const options = [
    { id: "light", label: "Claro", Icon: Sun },
    { id: "dark", label: "Oscuro", Icon: Moon },
    { id: "system", label: "Sistema", Icon: Monitor },
  ];

  const CurrentIcon = options.find((o) => o.id === theme)?.Icon ?? Monitor;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-2 rounded-lg text-mariner-500 hover:text-mariner-700 hover:bg-mariner-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        aria-label="Cambiar tema"
      >
        <CurrentIcon size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-xl shadow-lg py-1 z-50">
          {options.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => { setTheme(id); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-mariner-50 dark:hover:bg-zinc-800 ${
                theme === id
                  ? "text-mariner-700 dark:text-zinc-200 font-semibold"
                  : "text-mariner-600 dark:text-zinc-400"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/inicio");
    window.location.hash = "#/inicio";
  }

  const linkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-mariner-100 text-mariner-700 dark:bg-zinc-800 dark:text-zinc-200"
        : "text-mariner-600 hover:text-mariner-800 hover:bg-mariner-50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-zinc-950 border-b border-mariner-100 dark:border-zinc-800 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Logo + brand */}
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <img
            src="/logo.png"
            alt="ComunidadIA"
            className="w-8 h-8 rounded-lg object-cover"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-mariner-900 dark:text-zinc-50">
              ComunidadIA
            </span>
            <span className="text-xs text-mariner-400 dark:text-zinc-500">
              IA para docentes
            </span>
          </div>
        </button>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1">
          <NavLink to="/home" className={linkClass}>Home</NavLink>
          <NavLink to="/publications" className={linkClass}>Publicaciones</NavLink>
          <NavLink to="/users" className={linkClass}>Usuarios</NavLink>
        </nav>

        {/* Right: user + theme + logout */}
        <div className="flex items-center gap-2">
          {user && (
            <span className="hidden md:block text-sm font-medium text-mariner-700 dark:text-zinc-400">
              {user.nick_name}
            </span>
          )}
          <ThemeDropdown />
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-mariner-600 hover:text-mariner-800 hover:bg-mariner-50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>

      </div>
    </header>
  );
}
