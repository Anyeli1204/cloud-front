import { AdminInformationRequest } from "@interfaces/admin-info/AdminInformationRequest";
import {
	AdminInformationResponse,
	AdminAlert,
} from "@interfaces/admin-info/AdminInformationResponse";
import { QuestionAnswerResponse } from "@interfaces/QA/QuestionAnswerResponse";
import { AdminProfileSummary } from "@interfaces/user-info/UserInfoResponse";
import Api from "@services/api";

type AdminProfileResponse = {
	id: number;
	email: string;
	firstname: string;
	lastname: string;
	username: string;
	role: "USER" | "ADMIN";
	creationDate: string;
	isActive?: boolean;
	adminProfile?: AdminProfileSummary | null;
};

export async function adminInfo(
	adminInformationRequest: AdminInformationRequest,
): Promise<AdminInformationResponse> {
	const accountsApi = await Api.getInstance("accounts");
	const contentApi = await Api.getInstance("content");

	const profileResponse = await accountsApi.get<void, AdminProfileResponse>({
		url: `/auth/profile/${adminInformationRequest.adminId}`,
	});

	const answeredQuestionsResult = await contentApi
		.get<void, QuestionAnswerResponse[]>({
			url: `/questions/admin/${adminInformationRequest.adminId}`,
		})
		.catch((error) => {
			console.warn("No se pudieron obtener preguntas respondidas", error);
			return { data: [] as QuestionAnswerResponse[] };
		});

	const alerts: AdminAlert[] = [];

	return {
		id: profileResponse.data.id,
		email: profileResponse.data.email,
		firstname: profileResponse.data.firstname,
		lastname: profileResponse.data.lastname,
		username: profileResponse.data.username,
		role: profileResponse.data.role,
		creationDate: profileResponse.data.creationDate,
		isActive: profileResponse.data.isActive,
		adminProfile: profileResponse.data.adminProfile ?? null,
		answeredQuestions: answeredQuestionsResult.data ?? [],
		emmitedAlerts: alerts,
	};
}
