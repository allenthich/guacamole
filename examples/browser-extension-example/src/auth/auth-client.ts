import { createFeatureClient } from "better-feature/react";

export const featureClient = createFeatureClient({
	baseURL: "http://localhost:3000" /* base url of your Better Auth backend. */,
	plugins: [],
});
