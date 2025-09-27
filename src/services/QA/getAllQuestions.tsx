import Api from "@services/api";
import { QuestionAnswerResponse } from "@interfaces/QA/QuestionAnswerResponse";

export interface PaginatedQuestions {
	content: QuestionAnswerResponse[];
	last: boolean;
	totalElements: number;
	totalPages: number;
}

function buildPagination(
	list: QuestionAnswerResponse[],
	page: number,
	size: number,
): PaginatedQuestions {
	const totalElements = list.length;
	const totalPages = size > 0 ? Math.ceil(totalElements / size) : 1;
	const start = page * size;
	const end = size > 0 ? start + size : totalElements;
	const content = size > 0 ? list.slice(start, end) : list;
	return {
		content,
		last: page >= totalPages - 1,
		totalElements,
		totalPages,
	};
}

async function fetchQuestions(path: string) {
	const api = await Api.getInstance("content");
	const response = await api.get<void, QuestionAnswerResponse[]>({
		url: path,
	});
	return response.data ?? [];
}

export async function getQuestionsPaged(page = 0, size = 10) {
	const list = await fetchQuestions("/questions");
	return buildPagination(list, page, size);
}

export async function getAnsweredQuestionsPaged(page = 0, size = 10) {
	const list = await fetchQuestions("/questions/status/ANSWERED");
	return buildPagination(list, page, size);
}

export async function getPendingQuestionsPaged(page = 0, size = 10) {
	const list = await fetchQuestions("/questions/status/PENDING");
	return buildPagination(list, page, size);
}

export async function getAllQuestion() {
	return fetchQuestions("/questions");
}
