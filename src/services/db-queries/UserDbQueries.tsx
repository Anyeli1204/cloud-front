import { UserDBQueryRequest } from "@interfaces/db-queries/UserDBQueryRequest";
import { UserDbQueryResponse } from "@interfaces/db-queries/UserDbQueryResponse";

import Api from "@services/api";

export async function dbQueries(userDBQueryRequest: UserDBQueryRequest) {
	const api = await Api.getInstance();
	const response = await api.post<UserDBQueryRequest, UserDbQueryResponse>(
		userDBQueryRequest,
		{
			url: "/user/dbquery",
		},
	);
	return response;
}
