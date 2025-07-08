// src/components/RegisterForm.tsx
import React, { useState } from "react";
import { Input } from "@components/Input";
import { Eye, EyeOff } from "lucide-react";

interface RegisterFormProps {
	onSubmit: (
		firstname: string,
		lastname: string,
		username: string,
		email: string,
		password: string,
		confirmPassword: string,
	) => void;
}

export function RegisterForm({ onSubmit }: RegisterFormProps) {
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
		onSubmit(firstname, lastname, username, email, password, confirmPassword);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{error && (
				<div className="mb-2 p-3 bg-red-100 border border-red-300 text-red-700 rounded text-sm font-semibold">
					{error}
				</div>
			)}
			{/* Grid de 2 columnas */}
			<div className="grid grid-cols-2 gap-4">
				<div>
					<label
						htmlFor="first"
						className="block text-sm font-medium text-gray-700"
					>
						First Name
					</label>
					<Input
						id="first"
						type="text"
						placeholder="First Name"
						value={firstname}
						onChange={(e) => setFirstname(e.target.value)}
						required
					/>
				</div>

				<div>
					<label
						htmlFor="last"
						className="block text-sm font-medium text-gray-700"
					>
						Last Name
					</label>
					<Input
						id="last"
						type="text"
						placeholder="Last Name"
						value={lastname}
						onChange={(e) => setLastname(e.target.value)}
						required
					/>
				</div>

				<div>
					<label
						htmlFor="user"
						className="block text-sm font-medium text-gray-700"
					>
						Username
					</label>
					<Input
						id="user"
						type="text"
						placeholder="Username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						required
					/>
				</div>

				<div>
					<label
						htmlFor="email"
						className="block text-sm font-medium text-gray-700"
					>
						Email
					</label>
					<Input
						id="email"
						type="email"
						placeholder="joe@gmail.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
				</div>
			</div>

			{/* Última fila: password y confirm */}
			<div className="grid grid-cols-2 gap-4">
				<div>
					<label
						htmlFor="pass"
						className="block text-sm font-medium text-gray-700"
					>
						Password
					</label>
					<div className="relative">
						<Input
							id="pass"
							type={showPassword ? "text" : "password"}
							placeholder="********"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
						<button
							type="button"
							className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
							onClick={() => setShowPassword((v) => !v)}
							tabIndex={-1}
						>
							{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
						</button>
					</div>
					{password && !passwordValid && (
						<div className="text-xs text-red-600 mt-1">La contraseña debe tener al menos 8 caracteres, incluir letras y números.</div>
					)}
				</div>

				<div>
					<label
						htmlFor="confirm"
						className="block text-sm font-medium text-gray-700"
					>
						Confirm Password
					</label>
					<div className="relative">
						<Input
							id="confirm"
							type={showConfirm ? "text" : "password"}
							placeholder="********"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
						/>
						<button
							type="button"
							className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
							onClick={() => setShowConfirm((v) => !v)}
							tabIndex={-1}
						>
							{showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
						</button>
					</div>
					{confirmPassword && !passwordsMatch && (
						<div className="text-xs text-red-600 mt-1">Las contraseñas no coinciden.</div>
					)}
				</div>
			</div>

			<button
				type="submit"
				className="w-full py-3 bg-purple-600 text-white rounded-full font-semibold transition hover:bg-purple-700"
			>
				Register
			</button>
		</form>
	);
}
