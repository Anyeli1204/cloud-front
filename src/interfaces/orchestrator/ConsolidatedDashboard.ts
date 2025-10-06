// Interfaces para el endpoint /api/dashboard/consolidated del Microservicio 5

export interface User {
	id: number;
	email: string;
	role: string;
	created_at?: string;
}

export interface ScrapedAccount {
	id: number;
	account_name: string;
	user_id: number;
	created_at?: string;
}

export interface MetricItem {
	postId: string;
	usernameTiktokAccount: string;
	views: number;
	likes: number;
	engagement: number;
	datePosted: string;
}

export interface DashboardMetric {
	metric: string;
	totalPosts: number;
	totalViews: number;
	totalLikes: number;
	avgEngagement: number;
}

export interface Metrics {
	items: MetricItem[];
	count: number;
	dashboard: DashboardMetric[];
}

export interface DashboardDataItem {
	username: string;
	totalViews: number;
}

export interface ServicesStatus {
	microservice1: string;
	microservice2: string;
	microservice3: string;
	microservice4: string;
}

export interface ConsolidatedMetadata {
	total_users: number;
	total_accounts: number;
	total_posts_analyzed: number;
	timestamp: string;
	services_status: ServicesStatus;
}

export interface ConsolidatedDashboardResponse {
	users: User[];
	scraped_accounts: ScrapedAccount[];
	metrics: Metrics;
	dashboard_data: DashboardDataItem[];
	metadata: ConsolidatedMetadata;
}
