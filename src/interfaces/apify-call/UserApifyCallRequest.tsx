export interface UserApifyCallRequest {
	userId: number;
	hashtags?: string;
	keyWords?: string;
	dateFrom?: string;
	dateTo?: string;
	nlastPostByHashtags?: number;
	tiktokAccount?: string;
}
