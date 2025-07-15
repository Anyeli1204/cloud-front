
import React, { useState } from "react";
import { Logo } from "@components/Logo";
import { LoginForm } from "@components/LoginForm";
import { RegisterForm } from "@components/RegisterForm";
import { useAuthContext } from "@contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Typewriter } from 'react-simple-typewriter';
import '@fontsource/nunito/700.css';
import { motion } from "framer-motion";

const GradientStyles = () => (
  <style>{`
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes diagonalFlash {
      0% {
        opacity: 0;
        transform: translate(-60%, -60%) rotate(25deg) scale(1.1);
      }
      10% { opacity: 0.7; }
      20% {
        opacity: 1;
        transform: translate(-10%, -10%) rotate(25deg) scale(1.15);
      }
      40% {
        opacity: 0.7;
        transform: translate(40%, 40%) rotate(25deg) scale(1.1);
      }
      60% {
        opacity: 0;
        transform: translate(80%, 80%) rotate(25deg) scale(1.05);
      }
      100% {
        opacity: 0;
        transform: translate(80%, 80%) rotate(25deg) scale(1.05);
      }
    }
    .animated-bg {
      position: relative;
      background: linear-gradient(270deg, #9f7aea 0%, #ed64a6 50%, #63b3ed 100%);
      background-size: 600% 600%;
      animation: gradientShift 8s ease infinite;
      overflow: hidden;
    }
    .animated-bg::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      z-index: 1;
      pointer-events: none;
      background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%);
      filter: blur(32px);
      opacity: 0;
      animation: diagonalFlash 5s cubic-bezier(0.4,0,0.2,1) infinite;
    }
    .z-10 { position: relative; z-index: 10; }
  `}</style>
);

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>(() => {
    const path = window.location.pathname.split("/").pop();
    return path === "register" ? "register" : "login";
  });
  const { login, register } = useAuthContext();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Removido el useEffect que forzaba el tema

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await login({ email, password });
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (firstname: string, lastname: string, username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      await register({ firstname, lastname, username, email, password });
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <GradientStyles />
      <div className="animated-bg flex flex-col md:flex-row min-h-screen relative overflow-hidden">
        <div className="hidden md:block absolute right-0 top-0 h-full w-1/2 bg-gray-50 z-0" />

        <div className="flex flex-col justify-center items-center w-full md:w-1/2 z-10 px-4 md:px-8 text-center gap-2">
          <Logo mode={mode} animate={false} className="h-64 w-64 md:h-92 md:w-92 mb-0 mx-auto" />
          <h2 className="text-5xl font-extrabold text-white">
            <Typewriter
              words={["Analizamos", "Capturamos", "Transformamos"]}
              loop={0}
              cursor
              typeSpeed={80}
              deleteSpeed={60}
              delaySpeed={2000}
            />
          </h2>
          <p className="text-white text-lg md:text-xl font-medium max-w-md">
            tendencias virales en decisiones inteligentes.
          </p>
        </div>

        {/* Formulario lado derecho */}
        <div className="flex flex-col justify-center items-center w-full md:w-1/2 z-10 px-4 py-6 md:px-16 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-6"
          >
            <h2 className="text-4xl font-extrabold text-purple-700">
              {mode === 'login' ? '¡Bienvenido de vuelta!' : '¡Únete a nosotros!'}
            </h2>
            <p className="text-lg text-gray-600">
              {mode === 'login' ? 'Inicia sesión para acceder a tus métricas' : 'Crea tu cuenta y comienza a analizar'}
            </p>
          </motion.div>

          <div className="bg-white rounded-2xl shadow-2xl border p-6 w-full max-w-md">
            <div className="flex justify-center mb-4 space-x-2">
              <button
                onClick={() => setMode("login")}
                className={`px-4 py-2 rounded-xl border text-sm transition-all ${mode === "login" ? "bg-white text-purple-600 font-bold" : "bg-gray-100 text-gray-500"}`}
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => setMode("register")}
                className={`px-4 py-2 rounded-xl border text-sm transition-all ${mode === "register" ? "bg-white text-purple-600 font-bold" : "bg-gray-100 text-gray-500"}`}
              >
                Registrarse
              </button>
            </div>
            {mode === "login" ? (
              <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
            ) : (
              <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
            )}

            {/* Opción de cambiar entre login y register DENTRO de la tarjeta */}
            <div className="flex justify-center items-center mt-3">
              {mode === "login" ? (
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="flex items-center text-purple-500 hover:text-purple-700 font-semibold transition-all text-sm group opacity-80 hover:opacity-100"
                >
                  {/* Icono UserPlus */}
                  <svg className="w-4 h-4 mr-1 -ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                  <span className="">¿No tienes cuenta?</span>
                  <span className="underline ml-1 font-bold">Regístrate</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="flex items-center text-purple-500 hover:text-purple-700 font-semibold transition-all text-sm group opacity-80 hover:opacity-100"
                >
                  {/* Icono User */}
                  <svg className="w-4 h-4 mr-1 -ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                  <span className="">¿Ya tienes cuenta?</span>
                  <span className="underline ml-1 font-bold">Inicia sesión</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}