import { createFeatureClient } from "better-feature/vue";

export const featureClient = createFeatureClient();

export const {
	signIn,
	signOut,
	signUp,
	useSession,
	forgetPassword,
	resetPassword,
} = featureClient;
