import { QuestionAnswerResponse } from "@interfaces/QA/QuestionAnswerResponse";

import Api from "@services/api";

export async function getAllUsers() {
	const api = await Api.getInstance();
	const response = await api.post<void, QuestionAnswerResponse[]>(undefined, {
		url: "/auth/upgradetoadmin",
	});
	return response;
}
