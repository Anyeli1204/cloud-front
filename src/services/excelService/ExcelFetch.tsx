import Api from "@services/api";

export async function downloadExcel(
	requestBody: Record<string, any>[],
): Promise<Blob> {
	const api = await Api.getInstance();

	const response = await api.post<any, Blob>(requestBody, {
		url: "user/excel/download",
		responseType: "blob",
	});
	return response.data;
}
