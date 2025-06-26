export interface UserDbQueryResponse {
	id: number;
	userId: number;
	postId: string;
	datePosted: string;
	hourPosted: string;
	usernameTiktokAccount: string;
	postURL: string;
	views: number;
	likes: number;
	comments: number;
	saves: number;
	reposts: number;
	totalInteractions: number;
	engagement: number;
	numberHashtags: number;
	hashtags: string;
	soundId: string;
	soundURL: string;
	regionPost: string;
	dateTracking: string;
	timeTracking: string;
}
