// src/interfaces/apify-call/ApifyCallResponse.ts

/**
 * Representa la respuesta de la API de Apify Call,
 * con todos los campos ya tipados en camelCase.
 */
export interface ApifyCallResponse {
	/** Número total de hashtags */
	numberHashtags: number;
	/** Comentarios del post */
	comments: number;
	/** Fecha de publicación en formato YYYY-MM-DD */
	datePosted: string;
	/** Porcentaje de engagement */
	engagement: number;
	/** Texto completo de los hashtags */
	hashtags: string;
	/** Total de interacciones */
	totalInteractions: number;
	/** Total de likes */
	likes: number;
	/** URL completa del post */
	postURL: string;
	/** Código o ID del post */
	postId: string;
	/** Región donde se publicó */
	regionPost: string;
	/** Veces que se ha repostado */
	reposts: number;
	/** Veces que se ha guardado */
	saves: number;
	/** ID del sonido original */
	soundId: string;
	/** URL del sonido */
	soundURL: string;
	/** Nombre de usuario de la cuenta de TikTok */
	usernameTiktokAccount: string;
	/** Hora de publicación en formato HH:mm:ss */
	hourPosted: string;
	/** Fecha de rastreo en formato YYYY-MM-DD */
	dateTracking: string;
	/** Hora de rastreo en formato HH:mm:ss */
	timeTracking: string;
	/** Usuario que hizo la petición */
	userId?: string;
	/** Total de visualizaciones */
	views: number;
	adminId?: string;
}

export interface HashtagViews {
	hashtag: string;
	totalVistas: number;
}

export interface SoundViews {
	soundId: number;
	totalViews: number;
}

/**
 * Convierte un objeto "raw" con claves devueltas por la API
 * (p. ej. con espacios, mayúsculas, '# of Hashtags', etc.)
 * a un ApifyCallResponse con propiedades limpias y tipadas.
 */
export function mapRawToApifyResponse(
	raw: Record<string, any>,
): ApifyCallResponse {
	const getNumber = (...keys: string[]) => {
		for (const k of keys) {
			if (raw[k] !== undefined && raw[k] !== null && raw[k] !== "") {
				const n = Number(raw[k]);
				return Number.isNaN(n) ? 0 : n;
			}
		}
		return 0;
	};

	const getString = (...keys: string[]) => {
		for (const k of keys) {
			if (raw[k] !== undefined && raw[k] !== null) {
				return String(raw[k]);
			}
		}
		return "";
	};

	// Soportar user/admin en varias keys
	const getUserId = () => {
		if (raw["User"] != null) return String(raw["User"]);
		if (raw["userId"] != null) return String(raw["userId"]);
		if (raw["User ID"] != null) return String(raw["User ID"]);
		return undefined;
	};

	const getAdminId = () => {
		if (raw["Admin"] != null) return String(raw["Admin"]);
		if (raw["adminId"] != null) return String(raw["adminId"]);
		return undefined;
	};

	return {
		numberHashtags: getNumber(
			"# of Hashtags",
			"numberOfHashtags",
			"numberHashtags",
		),
		comments: getNumber("Comments", "comments"),
		datePosted: getString("Date posted", "datePosted"),
		engagement: getNumber("Engagement rate", "engagementRate", "engagement"),
		hashtags: getString("Hashtags", "hashtags"),
		totalInteractions: getNumber(
			"Interactions",
			"interactions",
			"totalInteractions",
		),
		likes: getNumber("Likes", "likes"),
		postURL: getString("Post Link", "postLink", "postURL"),
		postId: getString("Post code", "postCode", "postId"),
		regionPost: getString("Region of posting", "regionOfPosting", "regionPost"),
		reposts: getNumber("Reposted", "reposted", "reposts"),
		saves: getNumber("Saves", "saves"),
		soundId: getString("Sound ID", "soundId"),
		soundURL: getString("Sound URL", "soundUrl", "soundURL"),
		usernameTiktokAccount: getString(
			"TikTok Account Username",
			"tiktokAccountUsername",
			"usernameTiktokAccount",
			"username",
		),
		hourPosted: getString("Time posted", "timePosted", "hourPosted"),
		dateTracking: getString("Tracking date", "trackingDate", "dateTracking"),
		timeTracking: getString("Tracking time", "trackingTime", "timeTracking"),
		userId: getUserId(),
		adminId: getAdminId(),
		views: getNumber("Views", "views"),
	};
}
