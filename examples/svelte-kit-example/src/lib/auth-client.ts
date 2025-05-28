import { createFeatureClient } from "better-feature/svelte";

export const client = createFeatureClient({
	baseURL: "http://localhost:3000",
});
export const { signIn, signUp, useSession } = client;
