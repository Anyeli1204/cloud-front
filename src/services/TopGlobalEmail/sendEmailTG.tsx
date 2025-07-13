import { TopGlobalesEmailRequest } from "@interfaces/send-email-topGlobales/TopGlobalesEmailRequest";

import Api from "@services/api";

export async function sendTopGlobalEmail(emailReqs: any[]) {
	const api = await Api.getInstance();
	return api.post<any[], any>(emailReqs, {
		url: "/admin/sendemail",
	});
}
