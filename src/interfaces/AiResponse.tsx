export interface AiResponse {
	titulo: string;
	descripcion: string;
	hashtags: string[];
	sonidos_sugeridos: {
		nombre: string;
		url: string;
		imagen: string;
	}[];
	recomendacion: string;
}

export interface ScrapiResponse {
	hashtags: string[];
	keywords: string[];
	usernames: string[];
}