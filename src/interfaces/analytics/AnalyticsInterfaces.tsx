// Interfaces para el Microservicio 6 - Analytics

export interface UserBasic {
	id: string;
	firstname: string;
	lastname: string;
	username: string;
	creation_date: string;
}

export interface AdminMetrics {
	usernameTiktokAccount: string;
	total_posts: string;
	total_views: string;
	total_likes: string;
	total_comments: string;
	avg_views: string;
}

export interface TopPost {
	postid: string;
	usernameTiktokAccount: string;
	views: string;
	likes: string;
	comments: string;
}

export interface UsersListResponse {
	success: boolean;
	data: UserBasic[];
	count: number;
}

export interface AdminMetricsResponse {
	success: boolean;
	data: AdminMetrics[];
}

export interface TopPostsResponse {
	success: boolean;
	data: TopPost[];
	count: number;
}

export interface AnalyticsTable {
	tab_name: string;
}

export interface TablesListResponse {
	success: boolean;
	tables: string[];
	count: number;
	raw_data?: AnalyticsTable[];
}
