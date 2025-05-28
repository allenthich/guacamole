import {
	passkeyClient,
	twoFactorClient,
} from "@allenthich/better-feature/client/plugins";
import { createFeatureClient } from "@allenthich/better-feature/solid";
import { createFeatureClient as createVanillaClient } from "@allenthich/better-feature/client";
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
} = createFeatureClient({
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
