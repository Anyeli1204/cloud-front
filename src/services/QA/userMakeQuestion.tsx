import { userMakeQuestionRequest } from "@interfaces/QA/userMakeQuestionRequest";
import { QuestionAnswerResponse } from "@interfaces/QA/QuestionAnswerResponse";

import Api from "@services/api";

export async function makeQuestion(
	objectUserMakeQuestionRequest: userMakeQuestionRequest,
) {
	const api = await Api.getInstance();
	const response = await api.post<
		userMakeQuestionRequest,
		QuestionAnswerResponse
	>(objectUserMakeQuestionRequest, {
		url: "/user/createQuestion",
	});
	return response;
}
