import { AdminInformationRequest } from "@interfaces/admin-info/AdminInformationRequest";
import { AdminInformationResponse } from "@interfaces/admin-info/AdminInformationResponse";
import Api from "@services/api";

export async function adminInfo(
	adminInformationRequest: AdminInformationRequest,
) {
	const api = await Api.getInstance();
	const response = await api.post<
		AdminInformationRequest,
		AdminInformationResponse
	>(adminInformationRequest, {
		url: `/admin/profile/${adminInformationRequest.adminId}`,
	});
	return response;
}
