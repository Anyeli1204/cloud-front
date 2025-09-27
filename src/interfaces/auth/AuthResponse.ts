export interface AuthResponse {
	id: number;
	email: string;
	firstname: string;
	lastname: string;
	username: string;
	role: "USER" | "ADMIN";
	token: string;
	message?: string;
	isActive?: boolean;
}
