// src/context/AuthContext.tsx
import React, { createContext, ReactNode, useContext } from "react";
import { useStorageState } from "@hooks/useStorageState";
import { LoginRequest } from "@interfaces/auth/LoginRequest";
import { RegisterRequest } from "@interfaces/auth/RegisterRequest";
import { AuthResponse } from "@interfaces/auth/AuthResponse";
import { login as loginService } from "@services/auth/login";
import { register as registerService } from "@services/auth/register";

interface AuthContextType {
	register: (input: RegisterRequest) => Promise<void>;
	login: (input: LoginRequest) => Promise<void>;
	logout: () => void;
	session: string | null;
	isLoading: boolean;
	id: number | null;
	email: string | null;
	password: string | null;
	username: string | null;
	role: "USER" | "ADMIN" | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [[isLoading, session], setSession] = useStorageState("token");
	const [[, idStr], setId] = useStorageState("id");
	const [[, email], setEmail] = useStorageState("email");
	const [[, password], setPassword] = useStorageState("password");
	const [[, username], setUsername] = useStorageState("username");
	const [[, role], setRole] = useStorageState("role");

	const id = idStr ? Number(idStr) : null;

	function saveSession(data: AuthResponse) {
		setSession(data.token);
		setId(data.id?.toString() ?? null);
		setEmail(data.email ?? null);
		setPassword(data.password ?? null);
		setUsername(data.username ?? null);
		setRole(data.role ?? null);
	}

	// Limpia la sesión
	function clearSession() {
		setSession(null);
		setId(null);
		setEmail(null);
		setPassword(null);
		setUsername(null);
		setRole(null);
	}

	// Llama a tu servicio de login y guarda sesión
	async function login(input: LoginRequest) {
		const resp = await loginService(input);
		saveSession(resp.data);
	}

	// Llama a tu servicio de register y guarda sesión
	async function register(input: RegisterRequest) {
		const resp = await registerService(input);
		saveSession(resp.data);
	}

	// Desloguea simplemente limpiando storage
	function logout() {
		clearSession();
	}

	return (
		<AuthContext.Provider
			value={{
				register,
				login,
				logout,
				session,
				isLoading,
				id,
				email,
				password,
				username,
				role: role as "USER" | "ADMIN" | null,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuthContext(): AuthContextType {
	const ctx = useContext(AuthContext);
	if (!ctx) {
		throw new Error("useAuthContext must be used within an AuthProvider");
	}
	return ctx;
}
