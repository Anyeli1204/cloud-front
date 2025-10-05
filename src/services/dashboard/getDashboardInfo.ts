import { DashboardInfo } from "@interfaces/dashboard/DashboardInfo";
import Api from "@services/api";

export async function getDashboardInfo(): Promise<DashboardInfo[]> {
	const api = await Api.getInstance("dashboard");
	const response = await api.get<void, DashboardInfo[]>({
		url: "/getDashboardInfo",
	});
	return response.data;
}
