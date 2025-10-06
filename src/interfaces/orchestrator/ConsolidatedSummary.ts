// Interfaces para el endpoint /api/dashboard/summary del Microservicio 5

export interface SummaryStats {
	total_users: number;
	total_accounts: number;
	average_engagement: number;
	total_views: number;
	total_likes: number;
	total_interactions: number;
}

export interface TopUser {
	user_id: number;
	accounts_count: number;
	email: string;
}

export interface TopAccount {
	account: string;
	total_views: number;
	total_likes: number;
	total_engagement: number;
	post_count: number;
}

export interface BestEngagementPost {
	post_id: string;
	account: string;
	engagement: number;
	views: number;
	likes: number;
}

export interface Rankings {
	top_users: TopUser[];
	top_accounts: TopAccount[];
	best_engagement: BestEngagementPost[];
}

export interface Trends {
	growth_rate: number;
	engagement_trend: string;
}

export interface ConsolidatedSummaryResponse {
	summary: SummaryStats;
	rankings: Rankings;
	trends: Trends;
	timestamp: string;
}
