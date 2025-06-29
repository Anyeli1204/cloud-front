export interface UserDBQueryRequest {
	userId: number;
	tiktokUsernames?: string;
	postId?: string;
	datePostedFrom?: string;
	datePostedTo?: string;
	postURL?: string;
	minViews?: number;
	maxViews?: number;
	minLikes?: number;
	maxLikes?: number;
	minTotalInteractions?: number;
	maxTotalInteractions?: number;
	minEngagement?: number;
	maxEngagement?: number;
	hashtags?: string;
	soundId?: string;
	soundURL?: string;
	regionPost?: string;
}
