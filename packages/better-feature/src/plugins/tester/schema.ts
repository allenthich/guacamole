import { z } from "zod";
import type { AuthPluginSchema } from "../../types";

export const testerSchema = {
	tester: {
		fields: {
			name: {
				type: "string",
				required: false,
				sortable: true,
				unique: true,
				returned: true,
				transform: {
					input(value) {
						return value?.toString().toLowerCase();
					},
				},
			},
			displayName: {
				type: "string",
				required: false,
			},
		},
		modelName: "tester",
	},
} satisfies AuthPluginSchema;

export const testerZodSchema = z.object({
	tester: z.object({
		fields: z.object({
			name: z
				.string()
				.optional()
				.transform((value) => value?.toLowerCase()),
			displayName: z.string().optional(),
		}),
	}),
});

export type Tester = z.infer<typeof testerZodSchema>;
