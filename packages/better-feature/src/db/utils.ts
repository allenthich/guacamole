import { getFeatureTables, type FieldAttribute } from ".";
import { BetterFeatureError } from "../error";
import type { Adapter, BetterFeatureOptions } from "../types";
import { createKyselyAdapter } from "../adapters/kysely-adapter/dialect";
import { kyselyAdapter } from "../adapters/kysely-adapter";
import { memoryAdapter } from "../adapters/memory-adapter";
import { sequelizeAdapter, SequelizeAdapterConfig } from "../adapters/sequelize-adapter";
import { Sequelize } from "sequelize";
import { logger } from "../utils";

export async function getAdapter(
	options: BetterFeatureOptions,
): Promise<Adapter> {
	if (!options.database) {
		const tables = getFeatureTables(options);
		const memoryDB = Object.keys(tables).reduce((acc, key) => {
			// @ts-ignore
			acc[key] = [];
			return acc;
		}, {});
		logger.warn(
			"No database configuration provided. Using memory adapter in development",
		);
		return memoryAdapter(memoryDB)(options);
	}

	if (typeof options.database === "function") {
		return options.database(options);
	}

	// Check for Sequelize configuration BEFORE Kysely
	// Need to type assert options.database to check for 'sequelize' property safely
	const dbOption = options.database as any; // Use a more specific type if possible for checking
	if (dbOption && dbOption.sequelize && dbOption.sequelize instanceof Sequelize) {
		// It's a SequelizeAdapterConfig
		return sequelizeAdapter(dbOption as SequelizeAdapterConfig)(options);
	}

	const { kysely, databaseType } = await createKyselyAdapter(options);
	if (!kysely) {
		// This error might need to be re-evaluated if Sequelize is a valid option now
		// and doesn't fall through to here.
		throw new BetterFeatureError("Failed to initialize a compatible database adapter. Neither Sequelize nor Kysely configuration detected.");
	}
	return kyselyAdapter(kysely, {
		type: databaseType || "sqlite",
	})(options);
}

export function convertToDB<T extends Record<string, any>>(
	fields: Record<string, FieldAttribute>,
	values: T,
) {
	let result: Record<string, any> = values.id
		? {
				id: values.id,
			}
		: {};
	for (const key in fields) {
		const field = fields[key];
		const value = values[key];
		if (value === undefined) {
			continue;
		}
		result[field.fieldName || key] = value;
	}
	return result as T;
}

export function convertFromDB<T extends Record<string, any>>(
	fields: Record<string, FieldAttribute>,
	values: T | null,
) {
	if (!values) {
		return null;
	}
	let result: Record<string, any> = {
		id: values.id,
	};
	for (const [key, value] of Object.entries(fields)) {
		result[key] = values[value.fieldName || key];
	}
	return result as T;
}
