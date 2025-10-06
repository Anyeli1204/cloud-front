import { UserApifyCallRequest } from "@interfaces/apify-call/UserApifyCallRequest";
import { ApifyCallResponse } from "@interfaces/apify-call/ApifyCallResponse";

import Api from "@services/api";

export async function userApify(
	params: Omit<UserApifyCallRequest, "userId">,
): Promise<ApifyCallResponse[]> {
	const idStr = sessionStorage.getItem("id");
	if (!idStr) {
		throw new Error("No se encontró el userId en el storage");
	}
	const userId = Number(idStr);
	const payload: UserApifyCallRequest = {
		...params,
		userId,
	};
	console.log(payload);

	const MS3_URL = import.meta.env.VITE_API_SERVICE_MS3_URL;
	const response = await fetch(`${MS3_URL}/apify-connection/normalized`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});
	if (!response.ok) {
		throw new Error(`Error en la petición: ${response.statusText}`);
	}
	const result = await response.json();
	console.log(result);
	return result.data || [];
}
