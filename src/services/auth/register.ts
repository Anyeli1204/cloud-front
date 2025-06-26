import { RegisterRequest } from "@interfaces/auth/RegisterRequest";
import { AuthResponse } from "@interfaces/auth/AuthResponse";
import Api from "@services/api";

function saveAuthSession(data: AuthResponse) {
	sessionStorage.setItem("token", data.token);
	sessionStorage.setItem("id", data.id.toString());
	sessionStorage.setItem("email", data.email);
	sessionStorage.setItem("password", data.password);
	sessionStorage.setItem("username", data.username);
	sessionStorage.setItem("role", data.role);
}

export async function register(registerRequest: RegisterRequest) {
	const api = await Api.getInstance();
	const response = await api.post<RegisterRequest, AuthResponse>(
		registerRequest,
		{
			url: "/auth/signup",
		},
	);
	api.authorization = response.data.token;
	saveAuthSession(response.data);
	console.log(response.data);
	return response;
}
