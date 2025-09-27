export interface AdminProfileSummary {
	id: number;
	admisionToAdminDate: string;
	admisionToAdminTime: string;
	totalQuestionsAnswered: number;
	isActive: boolean;
}

export interface UserInfoResponse {
	id: number;
	email: string;
	firstname: string;
	lastname: string;
	username: string;
	role: "USER" | "ADMIN";
	creationDate: string;
	isActive?: boolean;
	amountScrappedAccount: number;
	filters: Filtro[];
	tiktokUsernameScraped: string[];
	adminProfile?: AdminProfileSummary | null;
}

export interface Filtro {
	[key: string]: string | number | boolean | null | undefined;
}
