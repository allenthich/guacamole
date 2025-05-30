import { twoFactorClient } from "@allenthich/better-feature/client/plugins";
import { createFeatureClient } from "@allenthich/better-feature/react";

export const { useSession, signIn, signOut, signUp, twoFactor } =
	createFeatureClient({
		baseURL: "http://localhost:3000",
		plugins: [twoFactorClient()],
	});
