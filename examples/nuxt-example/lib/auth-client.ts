import { createFeatureClient } from "better-feature/vue";

export const authClient = createFeatureClient();

export const {
	signIn,
	signOut,
	signUp,
	useSession,
	forgetPassword,
	resetPassword,
} = authClient;
