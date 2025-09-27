import { VisualizeAllUser } from "@interfaces/user-to-admin-Upgrade/VisualizeAllUser";
import Api from "@services/api";

export async function getAllUsers() {
	try {
		const api = await Api.getInstance("accounts");

		const response = await api.get<void, VisualizeAllUser[]>({
			url: "/auth/users",
		});
		return response;
	} catch (error: unknown) {
		const errorObj = error as any;
		throw error;
	}
}
