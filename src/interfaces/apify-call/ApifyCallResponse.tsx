// src/interfaces/apify-call/ApifyCallResponse.ts

/**
 * Representa la respuesta de la API de Apify Call,
 * con todos los campos ya tipados en camelCase.
 */
export interface ApifyCallResponse {
	/** Número total de hashtags */
	numberOfHashtags: number;
	/** Comentarios del post */
	comments: number;
	/** Fecha de publicación en formato YYYY-MM-DD */
	datePosted: string;
	/** Porcentaje de engagement */
	engagementRate: number;
	/** Texto completo de los hashtags */
	hashtags: string;
	/** Total de interacciones */
	interactions: number;
	/** Total de likes */
	likes: number;
	/** URL completa del post */
	postLink: string;
	/** Código o ID del post */
	postCode: string;
	/** Región donde se publicó */
	regionOfPosting: string;
	/** Veces que se ha repostado */
	reposted: number;
	/** Veces que se ha guardado */
	saves: number;
	/** ID del sonido original */
	soundId: string;
	/** URL del sonido */
	soundUrl: string;
	/** Nombre de usuario de la cuenta de TikTok */
	tiktokAccountUsername: string;
	/** Hora de publicación en formato HH:mm:ss */
	timePosted: string;
	/** Fecha de rastreo en formato YYYY-MM-DD */
	trackingDate: string;
	/** Hora de rastreo en formato HH:mm:ss */
	trackingTime: string;
	/** Usuario que hizo la petición */
	user?: string;
	/** Total de visualizaciones */
	views: number;
	admin?: string;
}

/**
 * Convierte un objeto "raw" con claves devueltas por la API
 * (p. ej. con espacios, mayúsculas, '# of Hashtags', etc.)
 * a un ApifyCallResponse con propiedades limpias y tipadas.
 */
export function mapRawToApifyResponse(
	raw: Record<string, any>,
): ApifyCallResponse {
	return {
		numberOfHashtags: Number(
			raw["# of Hashtags"] ?? raw["numberOfHashtags"] ?? 0,
		),
		comments: Number(raw["Comments"] ?? raw["comments"] ?? 0),
		datePosted: String(raw["Date posted"] ?? raw["datePosted"] ?? ""),
		engagementRate: Number(
			raw["Engagement rate"] ?? raw["engagementRate"] ?? 0,
		),
		hashtags: String(raw["Hashtags"] ?? raw["hashtags"] ?? ""),
		interactions: Number(raw["Interactions"] ?? raw["interactions"] ?? 0),
		likes: Number(raw["Likes"] ?? raw["likes"] ?? 0),
		postLink: String(raw["Post Link"] ?? raw["postLink"] ?? ""),
		postCode: String(raw["Post code"] ?? raw["postCode"] ?? ""),
		regionOfPosting: String(
			raw["Region of posting"] ?? raw["regionOfPosting"] ?? "",
		),
		reposted: Number(raw["Reposted"] ?? raw["reposted"] ?? 0),
		saves: Number(raw["Saves"] ?? raw["saves"] ?? 0),
		soundId: String(raw["Sound ID"] ?? raw["soundId"] ?? ""),
		soundUrl: String(raw["Sound URL"] ?? raw["soundUrl"] ?? ""),
		tiktokAccountUsername: String(
			raw["TikTok Account Username"] ?? raw["tiktokAccountUsername"] ?? "",
		),
		timePosted: String(raw["Time posted"] ?? raw["timePosted"] ?? ""),
		trackingDate: String(raw["Tracking date"] ?? raw["trackingDate"] ?? ""),
		trackingTime: String(raw["Tracking time"] ?? raw["trackingTime"] ?? ""),
		user: raw["User"] != null ? String(raw["User"]) : undefined,
		admin: raw["Admin"] != null ? String(raw["Admin"]) : undefined,
		views: Number(raw["Views"] ?? raw["views"] ?? 0),
	};
}
