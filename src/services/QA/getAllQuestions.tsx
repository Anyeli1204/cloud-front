import { QuestionAnswerResponse } from "@interfaces/QA/QuestionAnswerResponse";

import Api from "@services/api";

export async function getQuestions() {
	const api = await Api.getInstance();
	const response = await api.get<void, QuestionAnswerResponse>({
		url: "/user/getAllQuestions",
	});
	return response;
}
