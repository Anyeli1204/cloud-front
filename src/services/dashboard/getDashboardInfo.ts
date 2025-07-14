import { DashboardInfo } from "@interfaces/dashboard/DashboardInfo";
import Api from "@services/api";

export async function getDashboardInfo(): Promise<DashboardInfo[]> {
	const api = await Api.getInstance();
	const response = await api.get<void, DashboardInfo[]>({
		url: "/user/getDashboardInfo",
	});
	console.log(response.data);
	return response.data;
}
