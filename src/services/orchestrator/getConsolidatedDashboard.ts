import Api from "@services/api";
import type { ConsolidatedDashboardResponse } from "@interfaces/orchestrator/ConsolidatedDashboard";

/**
 * Obtiene el dashboard consolidado de todos los microservicios
 * @param userId - ID opcional del usuario para filtrar
 * @returns Promise con los datos consolidados
 */
export async function getConsolidatedDashboard(
	userId?: number
): Promise<ConsolidatedDashboardResponse> {
	const api = await Api.getInstance("orchestrator");
	
	const url = userId 
		? `/api/dashboard/consolidated?user_id=${userId}`
		: "/api/dashboard/consolidated";
	
	const response = await api.get<void, ConsolidatedDashboardResponse>({
		url,
	});
	
	return response.data;
}
