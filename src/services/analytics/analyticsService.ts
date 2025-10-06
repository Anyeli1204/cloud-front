import Api from "../api";
import type {
	UsersListResponse,
	AdminMetricsResponse,
	TopPostsResponse,
	TablesListResponse,
} from "@interfaces/analytics/AnalyticsInterfaces";

/**
 * Servicio para interactuar con el Microservicio 6 - Analytics API
 * Endpoints de análisis y métricas sobre datos de AWS Athena
 */

/**
 * Obtiene la lista de usuarios registrados en el sistema
 * @param limit - Número máximo de usuarios a retornar (default: 10, max: 1000)
 */
export async function getUsersList(limit: number = 10) {
	const api = await Api.getInstance("analytics");
	const response = await api.get<void, UsersListResponse>({
		url: `/users/list?limit=${limit}`,
	});
	return response;
}

/**
 * Obtiene métricas de administradores con sus publicaciones en TikTok
 * @param limit - Número máximo de administradores a retornar (default: 10, max: 1000)
 */
export async function getAdminMetrics(limit: number = 10) {
	const api = await Api.getInstance("analytics");
	const response = await api.get<void, AdminMetricsResponse>({
		url: `/admins/questions_and_views?limit=${limit}`,
	});
	return response;
}

/**
 * Obtiene las publicaciones con más vistas
 * @param limit - Número máximo de publicaciones a retornar (default: 10, max: 100)
 */
export async function getTopPosts(limit: number = 10) {
	const api = await Api.getInstance("analytics");
	const response = await api.get<void, TopPostsResponse>({
		url: `/posts/top?limit=${limit}`,
	});
	return response;
}

/**
 * Obtiene la lista de todas las tablas disponibles en Athena
 * (Endpoint de debugging)
 */
export async function getTablesList() {
	const api = await Api.getInstance("analytics");
	const response = await api.get<void, TablesListResponse>({
		url: "/debug/tables",
	});
	return response;
}

/**
 * Ejecuta una consulta SQL personalizada en Athena
 * ⚠️ USAR CON PRECAUCIÓN - Solo para debugging
 * @param query - Consulta SQL a ejecutar
 */
export async function executeCustomQuery(query: string) {
	const api = await Api.getInstance("analytics");
	const response = await api.post<{ query: string }, any>(
		{ query },
		{ url: "/debug/query" }
	);
	return response;
}
