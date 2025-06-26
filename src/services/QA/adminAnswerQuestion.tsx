import { QuestionAnswerResponse } from "@interfaces/QA/QuestionAnswerResponse";
import { AdminAnswerQuestionRequest } from "@interfaces/QA/AdminAnswerQuestionRequest";

import Api from "@services/api";

export async function answerQuestion(
	adminAnswerQuestionRequest: AdminAnswerQuestionRequest,
) {
	const api = await Api.getInstance();
	const response = await api.patch<
		AdminAnswerQuestionRequest,
		QuestionAnswerResponse[]
	>(adminAnswerQuestionRequest, {
		url: "/admin/answerQuestion",
	});
	return response;
}
