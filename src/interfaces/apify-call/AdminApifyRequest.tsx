export interface AdminApifyRequest {
	apifyToken: string;
	excludePinnedPosts: boolean;
	resultsPerPage?: number;
	adminId?: number;
	hashtags?: string[];
	profileSorting?: string;
	searchQueries?: string[];
}
