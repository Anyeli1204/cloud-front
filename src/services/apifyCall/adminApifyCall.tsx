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

export async function adminApify(
	payload: AdminApifyRequest & { adminId: number },
): Promise<[ApifyCallResponse[], HashtagViews[], SoundViews[]]> {
	const MS3_URL = import.meta.env.VITE_API_SERVICE_MS3_URL;

	const response = await fetch(`${MS3_URL}/apify-connection/admin/normalized`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const text = await response.text().catch(() => "");
		throw new Error(`MS3 admin call failed: ${response.status} ${response.statusText} ${text}`);
	}

	const result = await response.json();
	// result.data === [ postsArray, hashtagsStats, soundsStats ]
	return (result?.data ?? []) as [
		ApifyCallResponse[],
		HashtagViews[],
		SoundViews[],
	];
}
