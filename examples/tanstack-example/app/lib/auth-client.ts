import { twoFactorClient } from "better-feature/client/plugins";
import { createAuthClient } from "better-feature/react";

export const { useSession, signIn, signOut, signUp, twoFactor } =
	createAuthClient({
		baseURL: "http://localhost:3000",
		plugins: [twoFactorClient()],
	});
