import { createAuthClient } from "better-feature/react";
import { passkeyClient, twoFactorClient } from "better-feature/client/plugins";

export const authClient = createAuthClient({
	plugins: [passkeyClient(), twoFactorClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
