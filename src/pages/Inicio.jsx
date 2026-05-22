import React from "react";
import { useNavigate } from "react-router-dom";

export default function Inicio() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-mariner-50 dark:bg-zinc-950">
      <div className="bg-white dark:bg-zinc-900 border border-mariner-100 dark:border-zinc-800 rounded-2xl shadow-sm p-10 max-w-lg w-full text-center">
        <img
          src="/logo.png"
          alt="ComunidadIA"
          className="w-20 h-20 rounded-2xl object-cover mx-auto mb-5 shadow-sm"
        />
        <h1 className="text-3xl font-bold text-mariner-950 dark:text-zinc-50 mb-2">
          ComunidadIA
        </h1>
        <p className="text-sm text-mariner-500 dark:text-zinc-400 mb-8 leading-relaxed">
          Una comunidad de docentes que comparten experiencias, guías y recursos
          sobre cómo usar Inteligencia Artificial en la educación.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={() => navigate("/signin")}
            className="px-5 py-2.5 bg-mariner-600 hover:bg-mariner-700 dark:bg-mariner-500 dark:hover:bg-mariner-400 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="px-5 py-2.5 border border-mariner-200 dark:border-zinc-700 text-mariner-700 dark:text-zinc-400 hover:bg-mariner-50 dark:hover:bg-zinc-800 text-sm font-semibold rounded-lg transition-colors"
          >
            Crear cuenta
          </button>
        </div>
      </div>
    </div>
  );
}
