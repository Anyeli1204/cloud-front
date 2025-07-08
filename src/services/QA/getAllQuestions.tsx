import Api from "@services/api";
import { QuestionAnswerResponse } from "@interfaces/QA/QuestionAnswerResponse";

interface QuestionsResponse {
	data: {
		content: QuestionAnswerResponse[];
		last: boolean;
		totalElements: number;
		totalPages: number;
	};
}

interface CountResponse {
	data: {
		total: number;
		answered: number;
		pending: number;
	};
}

export async function getQuestionsPaged(page = 0, size = 10) {
	const api = await Api.getInstance();
	const response = await api.get<void, QuestionsResponse>({
		url: `/user/getQuestionsPaged?page=${page}&size=${size}`,
	});
	return response;
}

// Obtener preguntas respondidas paginadas
export async function getAnsweredQuestionsPaged(page = 0, size = 10) {
	const api = await Api.getInstance();
	const response = await api.get<void, QuestionsResponse>({
		url: `/user/getQuestionsPaged?page=${page}&size=${size}&status=ANSWERED`,
	});
	return response;
}

// Obtener preguntas pendientes paginadas
export async function getPendingQuestionsPaged(page = 0, size = 10) {
	const api = await Api.getInstance();
	const response = await api.get<void, QuestionsResponse>({
		url: `/user/getQuestionsPaged?page=${page}&size=${size}&status=PENDING`,
	});
	return response;
}

// Obtener contador total de preguntas por estado
export async function getQuestionsCount() {
	const api = await Api.getInstance();
	const response = await api.get<void, CountResponse>({
		url: `/user/getQuestionsCount`,
	});
	return response;
}
