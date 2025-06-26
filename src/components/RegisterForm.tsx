// src/components/RegisterForm.tsx
import React, { useState } from "react";
import { Input } from "@components/Input";

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

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(firstname, lastname, username, email, password, confirmPassword);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
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
					<Input
						id="pass"
						type="password"
						placeholder="********"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</div>

				<div>
					<label
						htmlFor="confirm"
						className="block text-sm font-medium text-gray-700"
					>
						Confirm Password
					</label>
					<Input
						id="confirm"
						type="password"
						placeholder="********"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						required
					/>
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
