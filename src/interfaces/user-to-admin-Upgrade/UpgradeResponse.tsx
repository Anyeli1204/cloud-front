export interface UpgradeResponse {
	id: number;
	email: string;
	password: string;
	firstname: string;
	lastname: string;
	username: string;
	role: "USER" | "ADMIN";
	creationDate: string;
	admisionToAdminDate: string;
	admisionToAdminTime: string;
	totalQuestionsAnswered: number;
	isActive: boolean;
}
