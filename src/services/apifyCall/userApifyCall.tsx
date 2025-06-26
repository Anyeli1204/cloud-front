import { UserApifyCallRequest } from "@interfaces/apify-call/UserApifyCallRequest";
import { ApifyCallResponse } from "@interfaces/apify-call/ApifyCallResponse";

import Api from "@services/api";

export async function userApify(userApifyCallRequest: UserApifyCallRequest) {
	const api = await Api.getInstance();
	const response = await api.post<UserApifyCallRequest, ApifyCallResponse[]>(
		userApifyCallRequest,
		{
			url: "/user/apifycall",
		},
	);
	return response;
}
