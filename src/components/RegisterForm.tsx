// src/components/RegisterForm.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@components/Input";
import { Eye, EyeOff, Mail, Lock, User, UserCheck, ArrowRight, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { AnimatePresence } from "framer-motion";

interface RegisterFormProps {
	onSubmit: (
		firstname: string,
		lastname: string,
		username: string,
		email: string,
		password: string,
		confirmPassword: string,
	) => void;
	isLoading?: boolean;
	onBackToLogin?: () => void;
}

export function RegisterForm({ onSubmit, isLoading = false, onBackToLogin }: RegisterFormProps) {
	const [firstname, setFirstname] = useState("");
	const [lastname, setLastname] = useState("");
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [error, setError] = useState("");

	const passwordValid =
		password.length >= 8 &&
		/[A-Za-z]/.test(password) &&
		/[0-9]/.test(password);
	const passwordsMatch = password === confirmPassword;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!passwordValid) {
			setError("La contraseña debe tener al menos 8 caracteres, incluir letras y números.");
			return;
		}
		if (!passwordsMatch) {
			setError("Las contraseñas no coinciden.");
			return;
		}
		setError("");
		if (!isLoading) {
			onSubmit(firstname, lastname, username, email, password, confirmPassword);
		}
	};

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1
			}
		}
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 }
	};

	return (
		<motion.form
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			onSubmit={handleSubmit}
			className="space-y-5"
		>
			{/* Error message */}
			<AnimatePresence>
				{error && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className="flex items-center gap-2 text-red-200 font-medium bg-red-500/20 rounded-xl py-3 px-4 border border-red-400/30"
					>
						<XCircle size={20} />
						{error}
					</motion.div>
				)}
			</AnimatePresence>

			{/* Name fields */}
			<motion.div variants={itemVariants} className="grid grid-cols-2 gap-2">
				<div>
					<label htmlFor="first" className="block text-xs font-semibold text-gray-800 mb-1">
						Nombre
					</label>
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<User className="h-4 w-4 text-purple-400" />
						</div>
						<Input
							id="first"
							type="text"
							placeholder="Tu nombre"
							value={firstname}
							onChange={(e) => setFirstname(e.target.value)}
							required
							disabled={isLoading}
							className="pl-10 py-1.5"
						/>
					</div>
				</div>

				<div>
					<label htmlFor="last" className="block text-xs font-semibold text-gray-800 mb-1">
						Apellido
					</label>
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<User className="h-4 w-4 text-purple-400" />
						</div>
						<Input
							id="last"
							type="text"
							placeholder="Tu apellido"
							value={lastname}
							onChange={(e) => setLastname(e.target.value)}
							required
							disabled={isLoading}
							className="pl-10 py-1.5"
						/>
					</div>
				</div>
			</motion.div>

			{/* Username and Email */}
			<motion.div variants={itemVariants} className="grid grid-cols-2 gap-2">
				<div>
					<label htmlFor="user" className="block text-xs font-semibold text-gray-800 mb-1">
						Usuario
					</label>
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<UserCheck className="h-4 w-4 text-purple-400" />
						</div>
						<Input
							id="user"
							type="text"
							placeholder="usuario123"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
							disabled={isLoading}
							className="pl-10 py-1.5"
						/>
					</div>
				</div>

				<div>
					<label htmlFor="email" className="block text-xs font-semibold text-gray-800 mb-1">
						Email
					</label>
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Mail className="h-4 w-4 text-purple-400" />
						</div>
						<Input
							id="email"
							type="email"
							placeholder="tu@email.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							disabled={isLoading}
							className="pl-10 py-1.5"
						/>
					</div>
				</div>
			</motion.div>

			{/* Password fields */}
			<motion.div variants={itemVariants} className="grid grid-cols-2 gap-2">
				<div>
					<label htmlFor="pass" className="block text-xs font-semibold text-gray-800 mb-1">
						Contraseña
					</label>
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Lock className="h-4 w-4 text-purple-400" />
						</div>
						<Input
							id="pass"
							type={showPassword ? "text" : "password"}
							placeholder="••••••••"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							disabled={isLoading}
							className="pl-10 pr-12 py-1.5"
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
					{password && (
						<div className="mt-2 flex items-center gap-2 text-xs">
							{passwordValid ? (
								<CheckCircle className="h-4 w-4 text-green-400" />
							) : (
								<XCircle className="h-4 w-4 text-red-400" />
							)}
							<span className={passwordValid ? "text-green-400" : "text-red-400"}>
								Mínimo 8 caracteres, letras y números
							</span>
						</div>
					)}
				</div>

				<div>
					<label htmlFor="confirm" className="block text-xs font-semibold text-gray-800 mb-1">
						Confirmar
					</label>
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Lock className="h-4 w-4 text-purple-400" />
						</div>
						<Input
							id="confirm"
							type={showConfirm ? "text" : "password"}
							placeholder="••••••••"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
							disabled={isLoading}
							className="pl-10 pr-12 py-1.5"
						/>
						<button
							type="button"
							className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
							onClick={() => setShowConfirm((v) => !v)}
							tabIndex={-1}
							disabled={isLoading}
						>
							{showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
						</button>
					</div>
					{confirmPassword && (
						<div className="mt-2 flex items-center gap-2 text-xs">
							{passwordsMatch ? (
								<CheckCircle className="h-4 w-4 text-green-400" />
							) : (
								<XCircle className="h-4 w-4 text-red-400" />
							)}
							<span className={passwordsMatch ? "text-green-400 text-xs" : "text-red-400 text-xs"}>
								{passwordsMatch ? "Las contraseñas coinciden" : "Las contraseñas no coinciden"}
							</span>
						</div>
					)}
				</div>
			</motion.div>

			{/* Submit button */}
			<motion.div variants={itemVariants}>
				<button
					type="submit"
					disabled={isLoading}
					className="w-full py-1.5 bg-white text-purple-600 rounded-xl font-semibold transition-all duration-300 hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-1 shadow-lg"
				>
					{isLoading ? (
						<>
							<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
							Creando cuenta...
						</>
					) : (
						<>
							Crear Cuenta
							<ArrowRight size={20} />
						</>
					)}
				</button>
			</motion.div>

			{/* Back to login */}
			{onBackToLogin && (
				<motion.div variants={itemVariants} className="text-center">
					<button
						type="button"
						onClick={onBackToLogin}
						disabled={isLoading}
						className="text-gray-500 text-sm hover:underline flex items-center justify-center gap-2 mx-auto"
					>
						<ArrowLeft size={16} />
						¿Ya tienes cuenta? Inicia sesión
					</button>
				</motion.div>
			)}

			{/* Terms and conditions */}
			<motion.div variants={itemVariants} className="text-center">
				<p className="text-gray-500 text-xs text-center mt-3">
					Al registrarte, aceptas nuestros{" "}
					<button type="button" className="text-purple-400 hover:text-purple-600 underline">
						Términos y Condiciones
					</button>
				</p>
			</motion.div>
		</motion.form>
	);
}
