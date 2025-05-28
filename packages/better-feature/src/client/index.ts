import type { BetterFeaturePlugin } from "../types";
import type { BetterFeatureClientPlugin } from "./types";
export * from "./vanilla";
export * from "./query";
export * from "./types";

export const InferPlugin = <T extends BetterFeaturePlugin>() => {
	return {
		id: "infer-server-plugin",
		$InferServerPlugin: {} as T,
	} satisfies BetterFeatureClientPlugin;
};

//@ts-expect-error
export type * from "nanostores";
export type * from "@better-fetch/fetch";
