import type { Adapter } from "../../../types";
import type { BetterFeatureOptions } from "../../../types";

export const createTestOptions = (
	adapter: (options: BetterFeatureOptions) => Adapter,
	useNumberId = false,
) =>
	({
		database: adapter,
		user: {
			fields: { email: "email_address" },
			additionalFields: {
				test: {
					type: "string",
					defaultValue: "test",
				},
			},
		},
		session: {
			modelName: "sessions",
		},
		advanced: {
			database: {
				useNumberId,
			},
		},
	}) satisfies BetterFeatureOptions;
