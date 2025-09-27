import { QuestionAnswerResponse } from "@interfaces/QA/QuestionAnswerResponse";
import { AdminProfileSummary } from "@interfaces/user-info/UserInfoResponse";

export type AdminAlert = Record<string, string>;

export interface AdminInformationResponse {
	id: number;
	email: string;
	firstname: string;
	lastname: string;
	username: string;
	role: "USER" | "ADMIN";
	creationDate: string;
	isActive?: boolean;
	adminProfile?: AdminProfileSummary | null;
	answeredQuestions: QuestionAnswerResponse[];
	emmitedAlerts: AdminAlert[];
}
