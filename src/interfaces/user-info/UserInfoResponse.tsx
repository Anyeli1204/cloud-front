export interface UserInfoResponse {
	id: number;
	email: string;
	firstname: string;
	lastname: string;
	username: string;
	role: "USER" | "ADMIN";
	creationDate: string;
	amountScrappedAccount: number;
	filters: Filtro[];
	tiktokUsernameScraped: string[] | null;
}

export interface Filtro {
	[key: string]: any;
}
