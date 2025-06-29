import { UserDBQueryRequest } from "@interfaces/db-queries/UserDBQueryRequest";
import { UserDbQueryResponse } from "@interfaces/db-queries/UserDbQueryResponse";

import Api from "@services/api";

export async function dbQueries(userDBQueryRequest: UserDBQueryRequest) {
	const api = await Api.getInstance();
	const idStr = sessionStorage.getItem("id");
	if (!idStr) {
		throw new Error("No se encontró el userId en el storage");
	}
	const userId = Number(idStr);
	const payload: UserDBQueryRequest = {
		...userDBQueryRequest,
		userId,
	};
	console.log(payload);
	const response = await api.post<UserDBQueryRequest, UserDbQueryResponse>(
		payload,
		{
			url: "/user/dbquery",
		},
	);
	return response.data;
}
