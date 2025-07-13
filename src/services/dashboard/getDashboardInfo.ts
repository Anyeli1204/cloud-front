import { getDashboardInfo, TopGlobalEmailDTO } from "@services/dashboard/getDashboardInfo";

export interface TopGlobalEmailDTO extends TopGlobalesEmailRequest {
  postId: string;
}

export async function getDashboardInfo(): Promise<TopGlobalEmailDTO[]> {
  const api = await Api.getInstance();
  const response = await api.get<TopGlobalEmailDTO[]>({
    url: "/user/getDashboardInfo",
  });
  console.log(response.data);
  return response.data;
} 