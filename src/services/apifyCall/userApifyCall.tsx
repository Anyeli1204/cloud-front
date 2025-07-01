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
	console.log(userId);
	const payload: UserApifyCallRequest = {
		...params,
		userId,
	};
	const api = await Api.getInstance();
	const response = await api.post<UserApifyCallRequest, ApifyCallResponse[]>(
		payload,
		{ url: "/user/apifycall" },
	);
	return response.data;
}
