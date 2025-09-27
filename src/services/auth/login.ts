import { LoginRequest } from "@interfaces/auth/LoginRequest";
import { AuthResponse } from "@interfaces/auth/AuthResponse";

import AccountsApi from "@services/accountsApi";

function saveAuthSession(data: AuthResponse) {
	sessionStorage.setItem("token", data.token);
	sessionStorage.setItem("id", data.id.toString());
	sessionStorage.setItem("email", data.email);
	sessionStorage.setItem("firstname", data.firstname);
	sessionStorage.setItem("lastname", data.lastname);
	sessionStorage.setItem("username", data.username);
	sessionStorage.setItem("role", data.role);
}

export async function login(loginRequest: LoginRequest) {
	const api = await AccountsApi.getInstance();
	const response = await api.post<LoginRequest, AuthResponse>(loginRequest, {
		url: "/auth/signin",
	});

	saveAuthSession(response.data);
	return response;
}
