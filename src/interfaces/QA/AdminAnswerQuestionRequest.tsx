export interface AdminAnswerQuestionRequest {
	status: "ANSWERED";
	questionId: number;
	adminId: number;
	answerDescription: string;
}
