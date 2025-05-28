import type { Adapter, BetterFeatureOptions } from "better-feature";

export interface SchemaGenerator {
	(opts: {
		file?: string;
		adapter: Adapter;
		options: BetterFeatureOptions;
	}): Promise<{
		code?: string;
		fileName: string;
		overwrite?: boolean;
		append?: boolean;
	}>;
}
