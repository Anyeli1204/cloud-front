export interface QA {
	[pregunta: string]: string;
}

export interface AlertaEmitida {
	[id: number]: string;
}

export interface AdminInformationResponse {
	id: number;
	email: string;
	firstname: string;
	lastname: string;
	username: string;
	role: "USER" | "ADMIN";
	creationDate: string;
	admisionToAdminDate: string;
	admisionToAdminTime: string;
	totalQuestionsAnswered: number;
	isActive: boolean;
	questionAndAnswer: QA[];
	emmitedAlerts: AlertaEmitida[];
}
