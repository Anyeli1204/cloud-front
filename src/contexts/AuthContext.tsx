import { useStorageState } from "@hooks/useStorageState";
import { LoginRequest } from "@interfaces/auth/LoginRequest";
import { RegisterRequest } from "@interfaces/auth/RegisterRequest";
import Api from "@services/api";
import { login } from "@services/auth/login";
import { register } from "@services/auth/register";
import { createContext, ReactNode, useContext } from "react";

interface AuthContextType {
	register: (SignupRequest: RegisterRequest) => Promise<void>;
	login: (loginRequest: LoginRequest) => Promise<void>;
	logout: () => void;
	session?: string | null;
	isLoading: boolean;
	id: number | null;
	email: string | null;
	password: string | null;
	username: string | null;
	role: "USER" | "ADMIN" | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function loginHandler(
	loginRequest: LoginRequest,
	setSession: (value: string) => void,
	setId: (value: string | null) => void,
	setEmail: (value: string | null) => void,
	setPassword: (value: string | null) => void,
	setUsername: (value: string | null) => void,
	setRole: (value: string | null) => void,
) {
	const response = await login(loginRequest);
	setSession(response.data.token);
	const { id, email, password, username, role } = response.data;
	setId(id?.toString() ?? null);
	setEmail(email ?? null);
	setPassword(password ?? null);
	setUsername(username ?? null);
	setRole(role ?? null);
}

async function signupHandler(
	signupRequest: RegisterRequest,
	setSession: (value: string) => void,
	setId: (value: string | null) => void,
	setEmail: (value: string | null) => void,
	setPassword: (value: string | null) => void,
	setUsername: (value: string | null) => void,
	setRole: (value: string | null) => void,
) {
	const response = await register(signupRequest);
	const { id, email, password, username, role } = response.data;
	setSession(response.data.token);
	setId(id?.toString() ?? null);
	setEmail(email ?? null);
	setPassword(password ?? null);
	setUsername(username ?? null);
	setRole(role ?? null);
}

export function AuthProvider(props: { children: ReactNode }) {
	const [[isLoading, session], setSession] = useStorageState("token");
	const [[, idStr], setId] = useStorageState("id");
	const [[, email], setEmail] = useStorageState("email");
	const [[, password], setPassword] = useStorageState("password");
	const [[, username], setUsername] = useStorageState("username");
	const [[, role], setRole] = useStorageState("role");
	const id = idStr ? Number(idStr) : null;

	if (session)
		Api.getInstance().then((api) => {
			api.authorization = session;
		});

	return (
		<AuthContext.Provider
			value={{
				register: (signupRequest) =>
					signupHandler(
						signupRequest,
						setSession,
						setId,
						setEmail,
						setPassword,
						setUsername,
						setRole,
					),
				login: (loginRequest) =>
					loginHandler(
						loginRequest,
						setSession,
						setId,
						setEmail,
						setPassword,
						setUsername,
						setRole,
					),
				logout: () => {
					setSession(null);
					setId(null);
					setEmail(null);
					setPassword(null);
					setUsername(null);
					setRole(null);
				},
				session,
				isLoading,
				id,
				email,
				password,
				username,
				role: role as "USER" | "ADMIN" | null,
			}}
		>
			{props.children}
		</AuthContext.Provider>
	);
}

export function useAuthContext() {
	const context = useContext(AuthContext);
	if (context === undefined)
		throw new Error("useAuthContext must be used within a AuthProvider");
	return context;
}
