import { createAuthClient } from "better-auth/react";
import { testerClient } from "better-auth/client/plugins";
import { toast } from "sonner";

export const client = createAuthClient({
	plugins: [testerClient()],
	fetchOptions: {
		onError(e) {
			if (e.error.status === 429) {
				toast.error("Too many requests. Please try again later.");
			}
		},
	},
});

export const { tester, useListTesters } = client;

// Example usage of the tester plugin
// const returnValue = await tester.initiate({
// 	input: "test_input",
// });
