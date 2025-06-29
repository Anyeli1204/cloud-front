import { UserInfoRequest } from "@interfaces/user-info/UserInfoRequest";
import { UserInfoResponse } from "@interfaces/user-info/UserInfoResponse";
import Api from "@services/api";

export async function userInfo(userInfoRequest: UserInfoRequest) {
	const api = await Api.getInstance();
	const response = await api.get<void, UserInfoResponse>({
		url: `/user/profile/${userInfoRequest.userId}`,
	});
	return response;
}
