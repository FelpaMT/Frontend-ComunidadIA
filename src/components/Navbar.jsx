import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        await logout();
        navigate("/inicio");
        window.location.hash = "#/inicio";
    }

    return (
        <header className="navbar">
            <div className="navbar-inner">

                {/* IZQUIERDA — LOGO + MARCA */}
                <div
                    className="nav-left"
                    onClick={() => navigate("/home")}
                    style={{ cursor: "pointer" }}
                >
                    <img
                        src="/logo.png"
                        alt="ComunidadIA"
                        className="logo-navbar"
                    />

                    <div className="nav-brand">
                        <div className="nav-title">ComunidadIA</div>
                        <span className="nav-subtitle">IA para docentes</span>
                    </div>
                </div>

                {/* DERECHA — LINKS */}
                <nav className="nav-links">

                    <NavLink
                        to="/home"
                        className={({ isActive }) =>
                            "nav-link" + (isActive ? " active" : "")
                        }
                    >
                        Home
                    </NavLink>

                    <NavLink
                        to="/publications"
                        className={({ isActive }) =>
                            "nav-link" + (isActive ? " active" : "")
                        }
                    >
                        Publicaciones
                    </NavLink>

                    <NavLink
                        to="/users"
                        className={({ isActive }) =>
                            "nav-link" + (isActive ? " active" : "")
                        }
                    >
                        Usuarios
                    </NavLink>

                    {/* usuario logueado */}
                    {user && (
                        <span className="nav-username">
                            {user.nick_name}
                        </span>
                    )}

                    {/* logout estilo newsbreak */}
                    <button
                        className="nav-logout"
                        onClick={handleLogout}
                    >
                        Cerrar sesión
                    </button>
                </nav>
            </div>
        </header>
    );
}
