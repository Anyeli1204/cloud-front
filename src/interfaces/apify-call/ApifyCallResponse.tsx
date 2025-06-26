export interface ApifyCallResponse {
	postCode: string;
	datePosted: string;
	timePosted: string;
	tiktokAccountUsername: string;
	postLink: string;
	views: number;
	likes: number;
	comments: number;
	reposted: number;
	saves: number;
	engagementRate: number;
	interactions: number;
	hashtags: string;
	numberOfHashtags: number;
	soundId: string;
	soundUrl: string;
	regionOfPosting: string;
	trackingDate: string;
	trackingTime: string;
	User?: string;
	Admin?: string;
}
