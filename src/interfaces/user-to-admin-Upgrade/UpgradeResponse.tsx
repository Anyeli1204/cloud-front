export interface UpgradeResponse {
	id: number;
	email: string;
	firstname: string;
	lastname: string;
	username: string;
	role: "USER" | "ADMIN";
	admisionToAdminDate: string;
	admisionToAdminTime: string;
	totalQuestionsAnswered: number;
	isActive: boolean;
	message?: string;
}
