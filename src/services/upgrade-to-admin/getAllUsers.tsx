import { VisualizeAllUser } from "@interfaces/user-to-admin-Upgrade/VisualizeAllUser";
import Api from "@services/api";

export async function getAllUsers() {
	console.log("[getAllUsers] Intentando obtener usuarios...");
	try {
		const api = await Api.getInstance();
		console.log("[getAllUsers] Instancia de API obtenida");
		
		const response = await api.get<void, VisualizeAllUser[]>({
			url: "/auth/getAllUsers",
		});
		console.log("[getAllUsers] Respuesta recibida:", response);
		return response;
	} catch (error: unknown) {
		console.error("[getAllUsers] Error al obtener usuarios:", error);
		const errorObj = error as any;
		console.error("[getAllUsers] Detalles del error:", {
			message: errorObj?.message,
			response: errorObj?.response?.data,
			status: errorObj?.response?.status,
			statusText: errorObj?.response?.statusText
		});
		throw error;
	}
}
