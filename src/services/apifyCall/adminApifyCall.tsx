// src/services/apify-call/adminApifyCall.ts
import type { AdminApifyRequest } from "@interfaces/apify-call/AdminApifyRequest";
import type { ApifyCallResponse } from "@interfaces/apify-call/ApifyCallResponse";

// Estas dos las defines donde prefieras, por ejemplo en @interfaces/dashboard.ts
export interface HashtagViews {
	hashtag: string;
	totalVistas: number;
}
export interface SoundViews {
	soundId: number;
	totalViews: number;
}

import Api from "@services/api";

export async function adminApify(
	payload: AdminApifyRequest & { adminId: number },
): Promise<[ApifyCallResponse[], HashtagViews[], SoundViews[]]> {
	const api = await Api.getInstance();
	const response = await api.post<typeof payload, any>(payload, {
		url: "/admin/apifycall",
	});
	// response.data === [ postsArray, hashtagsStats, soundsStats ]
	return response.data as [ApifyCallResponse[], HashtagViews[], SoundViews[]];
}
