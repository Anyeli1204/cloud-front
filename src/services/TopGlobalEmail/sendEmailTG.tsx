import { TopGlobalesEmailRequest } from "@interfaces/send-email-topGlobales/TopGlobalesEmailRequest";

import Api from "@services/api";

export async function sendTopGlobalEmail(emailReqs: TopGlobalesEmailRequest[]) {
	// Validar que el usuario sea admin antes de hacer la llamada
	const userRole = sessionStorage.getItem("role");
	
	if (!userRole) {
		throw new Error("❌ Authentication error: User role not found. Please log in again.");
	}
	
	if (userRole !== "ADMIN") {
		throw new Error("❌ Access denied: Only administrators can send global emails");
	}

	const api = await Api.getInstance("dashboard");
	return api.post<TopGlobalesEmailRequest[], void>(emailReqs, {
		url: "/admin/sendemail",
	});
}
