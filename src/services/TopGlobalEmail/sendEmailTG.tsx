import { TopGlobalesEmailRequest } from "@interfaces/send-email-topGlobales/TopGlobalesEmailRequest";

import Api from "@services/api";

export async function sendTopGlobalEmail(
	topGlobalesEmailRequest: TopGlobalesEmailRequest[]
) {
	const api = await Api.getInstance();
	const response = await api.post<TopGlobalesEmailRequest[], string>(
		topGlobalesEmailRequest,
		{
			url: "/admin/sendemail",
		},
	);
	return response;
}
