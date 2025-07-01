import {
	logger,
	type Adapter,
	type BetterFeatureOptions,
} from "better-feature";
import { generateDrizzleSchema } from "./drizzle";
import { generatePrismaSchema } from "./prisma";
import { generateMigrations } from "./kysely";
import { generateSequelizeMigrations } from "./sequelize";

export const adapters = {
	prisma: generatePrismaSchema,
	drizzle: generateDrizzleSchema,
	kysely: generateMigrations,
	sequelize: generateSequelizeMigrations,
};

export const getGenerator = (opts: {
	adapter: Adapter;
	file?: string;
	options: BetterFeatureOptions;
}) => {
	const adapter = opts.adapter;
	const generator =
		adapter.id in adapters
			? adapters[adapter.id as keyof typeof adapters]
			: null;
	if (!generator) {
		logger.error(`${adapter.id} is not supported.`);
		process.exit(1);
	}
	return generator(opts);
};
