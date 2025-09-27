export interface QuestionAnswerResponse {
	id: number;
	status: "PENDING" | "ANSWERED";
	questionDescription: string;
	answerDescription?: string | null;
	adminId?: number | null;
	userId: number | null;
	questionDate?: string;
	questionHour?: string;
	answerDate?: string | null;
	answerHour?: string | null;
}
