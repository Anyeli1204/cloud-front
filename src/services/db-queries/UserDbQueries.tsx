import { UserDBQueryRequest } from "@interfaces/db-queries/UserDBQueryRequest";

export async function dbQueries(userDBQueryRequest: UserDBQueryRequest) {
	const idStr = sessionStorage.getItem("id");
	if (!idStr) {
		throw new Error("No se encontró el userId en el storage");
	}
	const userId = Number(idStr);
	const payload: UserDBQueryRequest = {
		...userDBQueryRequest,
		userId,
	};
	console.log(payload);
	const MS3_URL = import.meta.env.VITE_API_SERVICE_MS3_URL;
	const response = await fetch(`${MS3_URL}/dbquery/user`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});
	const result = await response.json();
	console.log(result);
	return result.items || [];
}
