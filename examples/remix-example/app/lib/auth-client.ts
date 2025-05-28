import { createFeatureClient } from "@allenthich/better-feature/react";
import {
	passkeyClient,
	twoFactorClient,
} from "@allenthich/better-feature/client/plugins";

export const featureClient = createFeatureClient({
	plugins: [passkeyClient(), twoFactorClient()],
});

export const { signIn, signUp, signOut, useSession } = featureClient;
