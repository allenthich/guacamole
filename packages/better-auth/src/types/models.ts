import type { BetterAuthOptions } from "./options";
import type {
	accountSchema,
	sessionSchema,
	userSchema,
	verificationSchema,
} from "../db/schema";
import type { Auth } from "../auth";
import type { InferFieldsFromOptions, InferFieldsFromPlugins } from "../db";
import type { StripEmptyObjects, UnionToIntersection } from "./helper";
import type { BetterAuthPlugin } from "./plugins";
import type { z } from "zod";

export type InferPluginTypes<O extends BetterAuthOptions> =
	O["plugins"] extends Array<infer P>
		? UnionToIntersection<
				P extends BetterAuthPlugin
					? P["$Infer"] extends Record<string, any>
						? P["$Infer"]
						: {}
					: {}
			>
		: {};

interface RateLimit {
	/**
	 * The key to use for rate limiting
	 */
	key: string;
	/**
	 * The number of requests made
	 */
	count: number;
	/**
	 * The last request time in milliseconds
	 */
	lastRequest: number;
}

export type { RateLimit };
