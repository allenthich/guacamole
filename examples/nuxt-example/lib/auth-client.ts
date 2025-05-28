import { createAuthClient } from "better-feature/vue";

export const authClient = createAuthClient();

export const {
	signIn,
	signOut,
	signUp,
	useSession,
	forgetPassword,
	resetPassword,
} = authClient;
