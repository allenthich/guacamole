import { createFeatureClient } from "better-feature/react";
import { passkeyClient, twoFactorClient } from "better-feature/client/plugins";

export const authClient = createFeatureClient({
	plugins: [passkeyClient(), twoFactorClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
