export interface UserDbPost {
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

/**
 * Segundo bloque: métricas agrupadas
 */

/**
 * El formato completo de la respuesta viene como un array de dos arrays:
 *  [ UserDbPost[], DbMetric[] ]
 */
export type UserDbQueryResponse = [UserDbPost[]];
