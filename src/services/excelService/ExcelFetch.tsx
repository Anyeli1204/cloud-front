import Api from "@services/api";

export async function downloadExcel(
	requestBody: Record<string, any>[],
): Promise<Blob> {
	try {
		const api = await Api.getInstance();
		
		// Log para debugging
		console.log("🔗 Excel download - Request body size:", requestBody.length);
		console.log("🔗 Excel download - API base URL:", import.meta.env.VITE_API_BASE_URL);
		
		// Corregir la URL para evitar doble barra
		const baseUrl = import.meta.env.VITE_API_BASE_URL?.endsWith('/') 
			? import.meta.env.VITE_API_BASE_URL.slice(0, -1) 
			: import.meta.env.VITE_API_BASE_URL;
		console.log("🔗 Excel download - Full URL will be:", baseUrl + "/user/excel/download");

		const response = await api.post<any, Blob>(requestBody, {
			url: "user/excel/download",
			responseType: "blob",
		});
		
		// Verificar que la respuesta sea un blob válido
		if (!response.data || response.data.size === 0) {
			throw new Error("El archivo Excel está vacío o no se generó correctamente");
		}
		
		return response.data;
	} catch (error: any) {
		console.error("Error al descargar Excel:", error);
		
		// Si es un error de CORS, mostrar mensaje específico
		if (error.message?.includes('CORS') || error.message?.includes('Access-Control')) {
			throw new Error("Error de CORS: No se puede acceder al servidor. Verifica la configuración del backend.");
		}
		
		// Si es un error de red
		if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
			throw new Error("Error de conexión: No se pudo conectar con el servidor. Verifica que el backend esté funcionando.");
		}
		
		// Si es un error de timeout
		if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
			throw new Error("Timeout: La petición tardó demasiado. Intenta nuevamente.");
		}
		
		// Error genérico
		throw new Error("No se pudo descargar el archivo Excel. Verifica tu conexión e intenta nuevamente.");
	}
}
