import type { FieldAttribute } from ".";
import type { AuthPluginSchema } from "../types/plugins";
import type { BetterAuthOptions } from "../types/options";
import { APIError } from "better-call";

export function parseOutputData<T extends Record<string, any>>(
	data: T,
	schema: {
		fields: Record<string, FieldAttribute>;
	},
) {
	const fields = schema.fields;
	const parsedData: Record<string, any> = {};
	for (const key in data) {
		const field = fields[key];
		if (!field) {
			parsedData[key] = data[key];
			continue;
		}
		if (field.returned === false) {
			continue;
		}
		parsedData[key] = data[key];
	}
	return parsedData as T;
}

export function getAllFields(options: BetterAuthOptions, table: string) {
	let schema: Record<string, FieldAttribute> = {};
	for (const plugin of options.plugins || []) {
		if (plugin.schema && plugin.schema[table]) {
			schema = {
				...schema,
				...plugin.schema[table].fields,
			};
		}
	}
	return schema;
}

export function parseInputData<T extends Record<string, any>>(
	data: T,
	schema: {
		fields: Record<string, FieldAttribute>;
		action?: "create" | "update";
	},
) {
	const action = schema.action || "create";
	const fields = schema.fields;
	const parsedData: Record<string, any> = {};
	for (const key in fields) {
		if (key in data) {
			if (fields[key].input === false) {
				if (fields[key].defaultValue) {
					parsedData[key] = fields[key].defaultValue;
					continue;
				}
				continue;
			}
			if (fields[key].validator?.input && data[key] !== undefined) {
				parsedData[key] = fields[key].validator.input.parse(data[key]);
				continue;
			}
			if (fields[key].transform?.input && data[key] !== undefined) {
				parsedData[key] = fields[key].transform?.input(data[key]);
				continue;
			}
			parsedData[key] = data[key];
			continue;
		}

		if (fields[key].defaultValue && action === "create") {
			parsedData[key] = fields[key].defaultValue;
			continue;
		}

		if (fields[key].required && action === "create") {
			throw new APIError("BAD_REQUEST", {
				message: `${key} is required`,
			});
		}
	}
	return parsedData as Partial<T>;
}

export function mergeSchema<S extends AuthPluginSchema>(
	schema: S,
	newSchema?: {
		[K in keyof S]?: {
			modelName?: string;
			fields?: {
				[P: string]: string;
			};
		};
	},
) {
	if (!newSchema) {
		return schema;
	}
	for (const table in newSchema) {
		const newModelName = newSchema[table]?.modelName;
		if (newModelName) {
			schema[table].modelName = newModelName;
		}
		for (const field in schema[table].fields) {
			const newField = newSchema[table]?.fields?.[field];
			if (!newField) {
				continue;
			}
			schema[table].fields[field].fieldName = newField;
		}
	}
	return schema;
}
