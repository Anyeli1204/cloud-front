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
	username: string | null;
	firstname: string | null;
	lastname: string | null;
	role: "USER" | "ADMIN" | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [[isLoading, session], setSession] = useStorageState("token");
	const [[, idStr], setId] = useStorageState("id");
	const [[, email], setEmail] = useStorageState("email");
	const [[, username], setUsername] = useStorageState("username");
	const [[, role], setRole] = useStorageState("role");
	const [[, firstname], setFirstname] = useStorageState("firstname");
	const [[, lastname], setLastname] = useStorageState("lastname");

	const id = idStr ? Number(idStr) : null;

	function saveSession(data: AuthResponse) {
		setSession(data.token);
		setId(data.id?.toString() ?? null);
		setEmail(data.email ?? null);
		setUsername(data.username ?? null);
		setRole(data.role ?? null);
		setFirstname(data.firstname ?? null);
		setLastname(data.lastname ?? null);
	}

	function clearSession() {
		setSession(null);
		setId(null);
		setEmail(null);
		setUsername(null);
		setRole(null);
		setFirstname(null);
		setLastname(null);
	}

	async function login(input: LoginRequest) {
		const resp = await loginService(input);
		saveSession(resp.data);
	}

	async function register(input: RegisterRequest) {
		const resp = await registerService(input);
		saveSession(resp.data);
	}

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
				username,
				firstname,
				lastname,
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
