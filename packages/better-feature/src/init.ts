import { defu } from "defu";
import { createInternalAdapter, getMigrations } from "./db";
import { getFeatureTables } from "./db/get-tables";
import { getAdapter } from "./db/utils";
import { createKyselyAdapter } from "./adapters/kysely-adapter/dialect"; // Added
import { memoryAdapter } from "./adapters/memory-adapter"; // Added
import { SequelizeAdapterConfig } from "./adapters/sequelize-adapter"; // Added
import type {
	Adapter,
	BetterFeatureOptions,
	BetterFeaturePlugin,
	SecondaryStorage,
} from "./types";
import { Kysely } from "kysely"; // Added
import { Sequelize } from "sequelize"; // Added
import { DEFAULT_SECRET } from "./utils/constants";
import { createLogger } from "./utils/logger";
import { generateId } from "./utils";
import { env, isProduction } from "./utils/env";
import { getBaseURL } from "./utils/url";
import type { LiteralUnion } from "./types/helper";
import { BetterFeatureError } from "./error";

// Added DBInstance type
export type DBInstance = Kysely<any> | Sequelize | Adapter | undefined;

export const init = async <CurrentDBInstance extends DBInstance>(
	options: BetterFeatureOptions
): Promise<FeatureContext<CurrentDBInstance>> => {
	const adapter = await getAdapter(options);
	let dbInstance: CurrentDBInstance;

	// Logic to determine dbInstance based on options.database
	if (!options.database) {
		dbInstance = undefined as CurrentDBInstance;
		// Check if adapter is memory adapter, then dbInstance can be the adapter itself
		if (adapter instanceof memoryAdapter) {
			dbInstance = adapter as CurrentDBInstance;
		}
	} else if (typeof options.database === "function") {
		// Custom adapter, dbInstance might be the adapter itself or something else.
		dbInstance = adapter as CurrentDBInstance;
	} else if ((options.database as SequelizeAdapterConfig).sequelize instanceof Sequelize) {
		dbInstance = (options.database as SequelizeAdapterConfig).sequelize as CurrentDBInstance;
	} else if ((options.database as { db?: Kysely<any> }).db instanceof Kysely) {
		dbInstance = (options.database as { db: Kysely<any> }).db as CurrentDBInstance;
	} else if (options.database instanceof Kysely) { // Direct Kysely instance
		dbInstance = options.database as CurrentDBInstance;
	} else {
		// Default or fallback: Kysely from createKyselyAdapter, or undefined if it fails
		const { kysely } = await createKyselyAdapter(options);
		dbInstance = kysely as CurrentDBInstance;
		if (!dbInstance && !(adapter instanceof memoryAdapter)) {
			logger.warn("Could not determine specific DB instance for FeatureContext.db, falling back to adapter.")
			dbInstance = adapter as CurrentDBInstance;
		}
	}

	const plugins = options.plugins || [];
	const internalPlugins = getInternalPlugins(options);
	const logger = createLogger(options.logger);

	const baseURL = getBaseURL(options.baseURL, options.basePath);

	const secret =
		options.secret ||
		env.BETTER_AUTH_SECRET ||
		env.AUTH_SECRET ||
		DEFAULT_SECRET;

	if (secret === DEFAULT_SECRET) {
		if (isProduction) {
			logger.error(
				"You are using the default secret. Please set `BETTER_AUTH_SECRET` in your environment variables or pass `secret` in your auth config.",
			);
		}
	}

	options = {
		...options,
		secret,
		baseURL: baseURL ? new URL(baseURL).origin : "",
		basePath: options.basePath || "/",
		plugins: plugins.concat(internalPlugins),
	};
	const tables = getFeatureTables(options);
	const generateIdFunc: FeatureContext<CurrentDBInstance>["generateId"] = ({ model, size }) => {
		if (typeof options.advanced?.generateId === "function") {
			return options.advanced.generateId({ model, size });
		}
		if (typeof options?.advanced?.database?.generateId === "function") {
			return options.advanced.database.generateId({ model, size });
		}
		return generateId(size);
	};

	const ctx: FeatureContext<CurrentDBInstance> = {
		appName: options.appName || "Better Feature",
		options,
		tables,
		db: dbInstance, // Added db property
		trustedOrigins: getTrustedOrigins(options),
		baseURL: baseURL || "",
		secret,
		rateLimit: {
			...options.rateLimit,
			enabled: options.rateLimit?.enabled ?? isProduction,
			window: options.rateLimit?.window || 10,
			max: options.rateLimit?.max || 100,
			storage:
				options.rateLimit?.storage ||
				(options.secondaryStorage ? "secondary-storage" : "memory"),
		},
		logger: logger,
		generateId: generateIdFunc,
		secondaryStorage: options.secondaryStorage,
		adapter: adapter,
		// internalAdapter will be set after plugin init
		internalAdapter: {} as ReturnType<typeof createInternalAdapter>, // Placeholder
		runMigrations: async () => {
			//only run migrations if database is provided and it's not an adapter
			if (!options.database || "updateMany" in options.database) {
				throw new BetterFeatureError(
					"Database is not provided or it's an adapter. Migrations are only supported with a database instance.",
				);
			}
			const { runMigrations } = await getMigrations(options);
			await runMigrations();
		},
	};
	let { context } = runPluginInit<CurrentDBInstance>(ctx); // Made generic
	// Set internalAdapter after plugins have potentially modified options/hooks
	context.internalAdapter = createInternalAdapter(context.adapter, {
		options: context.options,
		hooks: context.options.databaseHooks ? [context.options.databaseHooks] : [], // This needs to collect all hooks
			generateId: context.generateId,
		});
	return context as FeatureContext<CurrentDBInstance>; // Cast if necessary
};

// Made FeatureContext generic
export type FeatureContext<DatabaseType extends DBInstance = Adapter> = {
	options: BetterFeatureOptions;
	appName: string;
	baseURL: string;
	trustedOrigins: string[];
	logger: ReturnType<typeof createLogger>;
	rateLimit: {
		enabled: boolean;
		window: number;
		max: number;
		storage: "memory" | "database" | "secondary-storage";
	} & BetterFeatureOptions["rateLimit"];
	adapter: Adapter; // Generic adapter interface
	db: DatabaseType; // Typed ORM instance
	internalAdapter: ReturnType<typeof createInternalAdapter>;
	secret: string;
	generateId: (options: {
		model: string;
		size?: number;
	}) => string;
	secondaryStorage: SecondaryStorage | undefined;
	tables: ReturnType<typeof getFeatureTables>;
	runMigrations: () => Promise<void>;
};

// Made runPluginInit generic
function runPluginInit<CurrentDBInstance extends DBInstance>(ctx: FeatureContext<CurrentDBInstance>) {
	let options = ctx.options;
	const plugins = options.plugins || [];
	let context: FeatureContext<CurrentDBInstance> = ctx;
	const dbHooks: BetterFeatureOptions["databaseHooks"][] = [];

	// Collect initial hooks from options
	if (options.databaseHooks) {
		dbHooks.push(options.databaseHooks);
	}

	for (const plugin of plugins) {
		if (plugin.init) {
			// Pass the generic context to plugin.init
			// The plugin.init itself might not be generic, so its return type needs handling.
			const result = plugin.init(context as any); // Use `as any` for now if plugin.init is not generic
			if (typeof result === "object") {
				if (result.options) {
					const { databaseHooks: pluginDbHooks, ...restOpts } = result.options;
					if (pluginDbHooks) {
						dbHooks.push(pluginDbHooks);
					}
					options = defu(restOpts, options); // Apply plugin options over current options
				}
				if (result.context) {
					// The context returned by plugin.init might also need to be generic or handled carefully
					context = {
						...context,
						...(result.context as Partial<FeatureContext<CurrentDBInstance>>),
					};
				}
			}
		}
	}
	// Update options in context
	context.options = options;
	// Re-create internalAdapter with potentially modified options and all collected hooks
	context.internalAdapter = createInternalAdapter(context.adapter, {
		options: context.options,
		hooks: dbHooks.filter((u): u is NonNullable<typeof u> => u !== undefined),
		generateId: context.generateId,
	});
	return { context };
}

function getInternalPlugins(options: BetterFeatureOptions) {
	const plugins: BetterFeaturePlugin[] = [];
	if (options.advanced?.crossSubDomainCookies?.enabled) {
		//TODO: add internal plugin
	}
	return plugins;
}

function getTrustedOrigins(options: BetterFeatureOptions) {
	const baseURL = getBaseURL(options.baseURL, options.basePath);
	if (!baseURL) {
		return [];
	}
	const trustedOrigins = [new URL(baseURL).origin];
	if (options.trustedOrigins && Array.isArray(options.trustedOrigins)) {
		trustedOrigins.push(...options.trustedOrigins);
	}
	const envTrustedOrigins = env.BETTER_AUTH_TRUSTED_ORIGINS;
	if (envTrustedOrigins) {
		trustedOrigins.push(...envTrustedOrigins.split(","));
	}
	return trustedOrigins;
}
