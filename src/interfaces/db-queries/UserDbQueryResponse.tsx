export interface UserDbPost {
	id: number;
	userId: number;
	postId: string;
	datePosted: string; // e.g. "2025-06-24"
	hourPosted: string; // e.g. "04:37:44"
	usernameTiktokAccount: string;
	postURL: string;
	views: number;
	likes: number;
	comments: number;
	saves: number;
	reposts: number;
	totalInteractions: number;
	engagement: number; // e.g. 8.05
	numberHashtags: number;
	hashtags: string; // e.g. "#fyp, #beauty, ..."
	soundId: string;
	soundURL: string;
	regionPost: string; // e.g. "Not found: N/A"
	dateTracking: string; // e.g. "2025-06-26"
	timeTracking: string; // e.g. "11:19:21"
}

/**
 * Segundo bloque: métricas agrupadas
 */
export interface MetricByHashtag {
	type: "MetricByHashtag";
	category: string; // hashtag name, e.g. "#beauty"
	views: number;
	likes: number;
	avgEngagement: number;
	interactions: number;
}
export interface MetricByUsername {
	type: "metricsByUsername";
	category: string;
	views: number;
	likes: number;
	avgEngagement: number;
	interactions: number;
}

export interface MetricByDayOfWeek {
	type: "byDayOfWeek";
	category: string; // day name, e.g. "lunes"
	views: number;
	likes: number;
	avgEngagement: number;
	interactions: number; // always 0 in the sample
}

export type DbMetric = MetricByHashtag | MetricByDayOfWeek | MetricByUsername;

/**
 * El formato completo de la respuesta viene como un array de dos arrays:
 *  [ UserDbPost[], DbMetric[] ]
 */
export type UserDbQueryResponse = [UserDbPost[], DbMetric[]];
