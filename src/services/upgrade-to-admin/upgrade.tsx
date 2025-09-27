import { UpgradeToAdmin } from "@interfaces/user-to-admin-Upgrade/UpgradeToAdmin";
import { UpgradeResponse } from "@interfaces/user-to-admin-Upgrade/UpgradeResponse";
import Api from "@services/api";

export async function upgrade(upgradeToAdmin: UpgradeToAdmin) {
	const api = await Api.getInstance("accounts");
	const response = await api.patch<UpgradeToAdmin, UpgradeResponse>(
		upgradeToAdmin,
		{
			url: "/auth/upgrade-to-admin",
		},
	);
	return response;
}
