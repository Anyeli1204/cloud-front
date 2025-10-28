import { UserInfoRequest } from "@interfaces/user-info/UserInfoRequest";
import {
	UserInfoResponse,
	Filtro,
	AdminProfileSummary,
} from "@interfaces/user-info/UserInfoResponse";
import Api from "@services/api";

type UserProfileResponse = {
	id: number;
	email: string;
	firstname: string;
	lastname: string;
	username: string;
	role: "USER" | "ADMIN";
	creationDate: string;
	isActive?: boolean;
	adminProfile?: AdminProfileSummary | null;
};

type HistorialFilter = {
	id: number;
	filterName: string;
	filterConfig?: string | null;
	status: string;
	createdAt?: string;
};

type HistorialResponse = {
	id: number;
	userId: number;
	filtros: HistorialFilter[];
	startDate?: string;
	endDate?: string;
	executionTime?: number;
} | null;

type ScrapedAccountResponse = {
	id: number;
	accountName: string;
	userId: number;
	scrapedAt: string;
};

function parseFilterConfig(filter: HistorialFilter): Filtro {
	const base: Filtro = {
		"Filter Name": filter.filterName,
		Status: filter.status,
	};

	if (filter.createdAt) {
		base["Created At"] = filter.createdAt;
	}

	if (!filter.filterConfig) {
		return base;
	}

	try {
		const parsed = JSON.parse(filter.filterConfig);
		if (parsed && typeof parsed === "object") {
			return { ...parsed, ...base };
		}
		return { ...base, RawConfig: filter.filterConfig };
	} catch (error) {
		console.warn("No se pudo parsear filterConfig", error);
		return { ...base, RawConfig: filter.filterConfig };
	}
}

export async function userInfo(
	userInfoRequest: UserInfoRequest,
): Promise<UserInfoResponse> {
	const accountsApi = await Api.getInstance("accounts");
	const contentApi = await Api.getInstance("content");

	const profileResponse = await accountsApi.get<void, UserProfileResponse>({
		url: `/auth/profile/${userInfoRequest.userId}`,
	});

	const [historialResult, accountsResult] = await Promise.allSettled([
		contentApi.get<void, HistorialResponse>({
			url: `/historial/${userInfoRequest.userId}`,
		}),
		contentApi.get<void, ScrapedAccountResponse[]>({
			url: `/scrapedAccounts/user/${userInfoRequest.userId}`,
		}),
	]);

	const historialData =
		historialResult.status === "fulfilled" ? historialResult.value.data : null;

	// debug logs removed

	const scrapedAccounts =
		accountsResult.status === "fulfilled"
			? accountsResult.value.data ?? []
			: [];

	let filters: Filtro[] = (historialData?.filtros ?? []).map((filter) => {
		// Start from the parsed filter
		const parsed = parseFilterConfig(filter);

		// Ensure the historial id is available to the UI
		if (filter.id !== undefined && filter.id !== null) {
			parsed["HistorialId"] = filter.id;
		}

		// The API may return the date in several places: per-filter createdAt,
		// or at the parent historialData.startDate. Try a few possibilities.
		const created =
			filter.createdAt ?? (historialData && (historialData.startDate as string)) ?? (filter as any).startDate ?? undefined;
		if (created) parsed["Created At"] = created as string;

		return parsed;
	});

// If the API returned a top-level historial row but no per-filter entries,
// create a synthetic entry so the UI can render the historial id and startDate.
if ((historialData?.filtros ?? []).length === 0 && historialData) {
	const synthetic: Filtro = {};
	if (historialData.id !== undefined && historialData.id !== null) {
		synthetic["HistorialId"] = historialData.id;
	}
	if (historialData.startDate) {
		synthetic["Created At"] = historialData.startDate;
	}
	// push to the filters array so the UI will render at least one card
	filters = [synthetic, ...filters];
}

	const tiktokUsernameScraped = scrapedAccounts.map(
		(account) => account.accountName,
	);

	return {
		id: profileResponse.data.id,
		email: profileResponse.data.email,
		firstname: profileResponse.data.firstname,
		lastname: profileResponse.data.lastname,
		username: profileResponse.data.username,
		role: profileResponse.data.role,
		creationDate: profileResponse.data.creationDate,
		isActive: profileResponse.data.isActive,
		adminProfile: profileResponse.data.adminProfile ?? null,
		amountScrappedAccount: tiktokUsernameScraped.length,
		filters,
		tiktokUsernameScraped,
	};
}
