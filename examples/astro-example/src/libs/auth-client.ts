import { passkeyClient, twoFactorClient } from "better-feature/client/plugins";
import { createAuthClient } from "better-feature/solid";
import { createAuthClient as createVanillaClient } from "better-feature/client";
export const {
	signIn,
	signOut,
	useSession,
	signUp,
	passkey: passkeyActions,
	useListPasskeys,
	twoFactor: twoFactorActions,
	$Infer,
	updateUser,
	changePassword,
	revokeSession,
	revokeSessions,
} = createAuthClient({
	baseURL:
		process.env.NODE_ENV === "development"
			? "http://localhost:3000"
			: undefined,
	plugins: [
		passkeyClient(),
		twoFactorClient({
			twoFactorPage: "/two-factor",
		}),
	],
});

export const { useSession: useVanillaSession } = createVanillaClient({
	baseURL:
		process.env.NODE_ENV === "development"
			? "http://localhost:3000"
			: undefined,
});
