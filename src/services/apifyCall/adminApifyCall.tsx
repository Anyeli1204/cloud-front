import { AdminApifyRequest } from "@interfaces/apify-call/AdminApifyRequest";
import { ApifyCallResponse } from "@interfaces/apify-call/ApifyCallResponse";

import Api from "@services/api";

export async function adminApify(adminApifyRequest: AdminApifyRequest) {
	const api = await Api.getInstance();
	const response = await api.post<AdminApifyRequest, ApifyCallResponse[]>(
		adminApifyRequest,
		{
			url: "/admin/apifycall",
		},
	);
	return response;
}
