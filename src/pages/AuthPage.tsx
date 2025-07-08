// src/pages/AuthPage.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Logo } from "@components/Logo";
import { LoginForm } from "@components/LoginForm";
import { RegisterForm } from "@components/RegisterForm";
import { useAuthContext } from "@contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import type { LoginRequest } from "@interfaces/auth/LoginRequest";
import type { RegisterRequest } from "@interfaces/auth/RegisterRequest";

const GradientStyles = () => (
	<style>{`
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .animated-bg {
      background: linear-gradient(270deg,
        #9f7aea 0%,   /* lavanda vibrante */
        #ed64a6 50%,  /* rosa chillón */
        #63b3ed 100%  /* azul eléctrico */
      );
      background-size: 600% 600%;
      animation: gradientShift 8s ease infinite;
    }
  `}</style>
);

export default function AuthPage() {
	const [mode, setMode] = useState<"login" | "register">(() => {
		const path = window.location.pathname.split("/").pop();
		return path === "register" ? "register" : "login";
	});
	const { login, register, session } = useAuthContext();
	const navigate = useNavigate();
	const location = useLocation();
	const [loginError, setLoginError] = useState<string | null>(null);

	useEffect(() => {
		document.documentElement.classList.remove("dark");
	}, []);

	const handleLogin = async (email: string, password: string) => {
		const payload: LoginRequest = { email, password };
		try {
			await login(payload);
			setLoginError(null);
			navigate("/dashboard");
		} catch (err) {
			setLoginError("Contraseña incorrecta. Intente de nuevo.");
		}
	};

	const handleRegister = async (
		firstname: string,
		lastname: string,
		username: string,
		email: string,
		password: string,
		confirmPassword: string,
	) => {
		const payload: RegisterRequest = {
			firstname,
			lastname,
			username,
			email,
			password,
		};
		try {
			await register(payload);
			navigate("/dashboard");
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<>
			{" "}
			<GradientStyles />
			<div className="min-h-screen bg-gradient-to-br from-white to-pink-100 dark:bg-gradient-to-br dark:from-violet-900 dark:to-black text-gray-900 dark:text-white">
				<div className="flex flex-col items-center min-h-screen bg-gray-50 pt-16 px-4 pb-4 animated-bg">
					{/* Toggle buttons */}
					<div className="flex space-x-4 mb-6">
						<button
							onClick={() => setMode("login")}
							className={`px-5 py-2 rounded-full font-medium transition ${
								mode === "login"
									? "bg-purple-600 text-white"
									: "bg-gray-300 text-gray-700 hover:bg-gray-200"
							}`}
						>
							Iniciar sesión
						</button>
						<button
							onClick={() => setMode("register")}
							className={`px-5 py-2 rounded-full font-medium transition ${
								mode === "register"
									? "bg-purple-600 text-white"
									: "bg-gray-300 text-gray-700 hover:bg-gray-200"
							}`}
						>
							Registrarse
						</button>
					</div>

					<motion.div
						className={`flex flex-col ${mode === "register" ? "md:flex-row-reverse" : "md:flex-row"} w-full max-w-4xl bg-white rounded-3xl shadow-lg overflow-hidden dark:bg-white/80`}
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.5, ease: "easeOut" }}
					>
						{/* Form Panel */}
						<div className="flex flex-col items-center justify-center md:w-1/2 bg-gray-100 p-6 space-y-6">
							<h2 className="text-xl md:text-2xl font-bold text-gray-800 mt-2">
								{mode === "login" ? "Ingresa a ScrapeTok" : "¡Bienvenido!"}
							</h2>
							<div className="w-full max-w-sm">
								{mode === "login" ? (
									<>
										<LoginForm onSubmit={handleLogin} />
										{loginError && (
											<div className="mt-4 flex items-center justify-center gap-2 text-red-700 font-semibold bg-red-50 rounded-xl py-3 px-4 border border-red-200 shadow animate-fade-in">
												<svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/></svg>
												{loginError}
											</div>
										)}
									</>
								) : (
									<RegisterForm onSubmit={handleRegister} />
								)}
							</div>
						</div>

						{/* Message & Logo Panel */}
						<div className="hidden md:flex flex-col items-center justify-center md:w-3/5 p-6 space-y-4">
							<h3 className="text-2xl md:text-3xl font-semibold text-gray-800 mt-2">
								{mode === "login" ? "¡Bienvenido de vuelta!" : "¡Crea tu cuenta!"}
							</h3>
							<div className="text-sm text-gray-500 dark:text-gray-100 text-lg mb-2">
								{mode === "login"
									? "Inicia sesión para empezar a usar ScrapeTok y ver tus Tiktok metrics."
									: "Regístrate para acceder a todas las funcionalidades de ScrapeTok."}
							</div>
							<Logo mode={mode} animate={false} className="h-60 w-60 mt-2" />
						</div>
					</motion.div>
				</div>
			</div>
		</>
	);
}
