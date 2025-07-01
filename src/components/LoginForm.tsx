import React, { useState } from "react";
import { Input } from "@components/Input";

interface LoginFormProps {
	onSubmit: (email: string, password: string) => void;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(email, password);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div>
				<label
					htmlFor="login-email"
					className="block text-sm font-medium text-gray-700"
				>
					Email
				</label>
				<Input
					id="login-email"
					type="email"
					placeholder="example@gmail.com"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>
			</div>

			<div>
				<label
					htmlFor="login-password"
					className="block text-sm font-medium text-gray-700"
				>
					Password
				</label>
				<Input
					id="login-password"
					type="password"
					placeholder="********"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
				/>
			</div>

			<button
				type="submit"
				className="w-full py-3 bg-purple-600 text-white rounded-full font-semibold transition hover:bg-purple-700"
			>
				Iniciar Sesión
			</button>
		</form>
	);
}
