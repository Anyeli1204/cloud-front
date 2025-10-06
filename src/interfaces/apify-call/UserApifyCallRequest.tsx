export interface UserApifyCallRequest {
	apifyToken: string;
	excludePinnedPosts: boolean;
	userId: number;
	hashtags?: string[];
	searchQueries?: string[];
	oldestPostDate?: string;
	newestPostDate?: string;
	resultsPerPage?: number;
	profiles?: string[];
	profileSorting?: string;
}
