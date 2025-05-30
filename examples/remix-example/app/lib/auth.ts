import { betterFeature } from "@allenthich/better-feature";
import Database from "better-sqlite3";
import { twoFactor, passkey } from "@allenthich/better-feature/plugins";

export const feature = betterFeature({
	database: new Database("./sqlite.db"),
	emailAndPassword: {
		enabled: true,
		sendEmailVerificationOnSignUp: true,
		async sendVerificationEmail() {
			console.log("Send email to verify email address");
		},
		async sendResetPassword(url, user) {
			console.log("Send email to reset password");
		},
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID || "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
		},
		github: {
			clientId: process.env.GITHUB_CLIENT_ID || "",
			clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
		},
		discord: {
			clientId: process.env.DISCORD_CLIENT_ID || "",
			clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
		},
	},
	plugins: [twoFactor(), passkey()],
});
