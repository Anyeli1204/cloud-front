import Api from "@services/api";
import type { ConsolidatedSummaryResponse } from "@interfaces/orchestrator/ConsolidatedSummary";

/**
 * Obtiene el resumen y rankings consolidados
 * @param userId - ID opcional del usuario para filtrar
 * @returns Promise con el resumen y rankings
 */
export async function getConsolidatedSummary(
	userId?: number
): Promise<ConsolidatedSummaryResponse> {
	const api = await Api.getInstance("orchestrator");
	
	const url = userId 
		? `/api/dashboard/summary?user_id=${userId}`
		: "/api/dashboard/summary";
	
	const response = await api.get<void, ConsolidatedSummaryResponse>({
		url,
	});
	
	return response.data;
}
