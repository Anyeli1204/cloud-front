import { TopGlobalesEmailRequest } from "@interfaces/send-email-topGlobales/TopGlobalesEmailRequest";

import Api from "@services/api";

export async function sendTopGlobalEmail(emailReqs: TopGlobalesEmailRequest[]) {
	const api = await Api.getInstance();
	return api.post<TopGlobalesEmailRequest[], void>(emailReqs, {
		url: "/admin/sendemail",
	});
}
