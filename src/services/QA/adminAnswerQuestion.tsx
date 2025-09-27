import { QuestionAnswerResponse } from "@interfaces/QA/QuestionAnswerResponse";
import { AdminAnswerQuestionRequest } from "@interfaces/QA/AdminAnswerQuestionRequest";

import Api from "@services/api";

export async function answerQuestion(
	adminAnswerQuestionRequest: AdminAnswerQuestionRequest,
) {
	const api = await Api.getInstance("content");
	const response = await api.post<
		AdminAnswerQuestionRequest,
		QuestionAnswerResponse
	>(adminAnswerQuestionRequest, {
		url: "/questions/reply",
	});
	return response;
}
