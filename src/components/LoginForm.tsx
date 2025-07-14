import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@components/Input";
import { Eye, EyeOff, Mail, Lock, ArrowRight, UserPlus } from "lucide-react";

interface LoginFormProps {
	onSubmit: (email: string, password: string) => void;
	isLoading?: boolean;
	onGoToRegister?: () => void;
}

export function LoginForm({ onSubmit, isLoading = false, onGoToRegister }: LoginFormProps) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!isLoading) {
			try {
				await onSubmit(email, password);
				setError("");
			} catch {
				setError("Correo o contraseña incorrectos. Intenta de nuevo.");
			}
		}
	};

	return (
		<motion.form
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
			onSubmit={handleSubmit}
			className="space-y-6"
		>
			{/* Mensaje de error */}
			{error && (
				<div className="flex items-center gap-2 bg-red-100 text-red-600 text-sm font-semibold rounded-xl py-2 px-4 border border-red-200 shadow-sm mb-2 whitespace-nowrap">
					{/* Icono de advertencia */}
					<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
						<circle cx="12" cy="12" r="10" />
						<line x1="12" y1="8" x2="12" y2="12" />
						<line x1="12" y1="16" x2="12.01" y2="16" />
					</svg>
					<span className="truncate">{error}</span>
				</div>
			)}
			{/* Email field */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.1 }}
			>
				<label
					htmlFor="login-email"
					className="block text-sm font-semibold text-gray-800 mb-2"
				>
					Correo electrónico
				</label>
				<div className="relative">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Mail className="h-5 w-5 text-purple-400" />
					</div>
					<Input
						id="login-email"
						type="email"
						placeholder="tu@email.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						disabled={isLoading}
						className="pl-10"
					/>
				</div>
			</motion.div>

			{/* Password field */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.2 }}
			>
				<label
					htmlFor="login-password"
					className="block text-sm font-semibold text-gray-800 mb-2"
				>
					Contraseña
				</label>
				<div className="relative">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Lock className="h-5 w-5 text-purple-400" />
					</div>
					<Input
						id="login-password"
						type={showPassword ? "text" : "password"}
						placeholder="••••••••"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						disabled={isLoading}
						className="pl-10 pr-12"
					/>
					<button
						type="button"
						className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
						onClick={() => setShowPassword((v) => !v)}
						tabIndex={-1}
						disabled={isLoading}
					>
						{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
					</button>
				</div>
			</motion.div>

			{/* Submit button */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.3 }}
			>
				<button
					type="submit"
					disabled={isLoading}
					className="w-full py-4 bg-white text-purple-600 rounded-xl font-semibold transition-all duration-300 hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg"
				>
					{isLoading ? (
						<>
							<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
							Iniciando sesión...
						</>
					) : (
						<>
							Iniciar Sesión
							<ArrowRight size={20} />
						</>
					)}
				</button>
			</motion.div>

			{/* Forgot password and register links */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.4 }}
				className="space-y-3 text-center"
			>				
				{onGoToRegister && (
					<div className="pt-2 border-t border-white/10">
						<button
							type="button"
							onClick={onGoToRegister}
							disabled={isLoading}
							className="flex items-center justify-center gap-1 mx-auto text-purple-400 hover:text-purple-600 text-sm font-semibold transition-all opacity-80 hover:opacity-100"
						>
							<UserPlus size={16} className="mr-1 -ml-1" />
							<span>¿No tienes cuenta?</span>
							<span className="underline font-bold ml-1">Regístrate</span>
						</button>
					</div>
				)}
			</motion.div>
		</motion.form>
	);
}
