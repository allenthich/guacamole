import { twoFactor } from "@allenthich/better-feature/plugins";
import { betterFeature } from "@allenthich/better-feature";
import Database from "better-sqlite3";

export const feature = betterFeature({
	database: new Database("data.db"),
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		discord: {
			enabled: true,
			clientId: process.env.DISCORD_CLIENT_ID!,
			clientSecret: process.env.DISCORD_CLIENT_SECRET!,
		},
		github: {
			enabled: true,
			clientId: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!,
		},
	},
	plugins: [twoFactor()],
});
