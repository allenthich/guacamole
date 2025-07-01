import { getFeatureTables, type FieldType } from "better-feature/db";
import { existsSync } from "fs";
import path from "path";
import fs from "fs/promises";
import { capitalizeFirstLetter } from "better-feature";
import type { SchemaGenerator } from "./types";

export const generateSequelizeMigrations: SchemaGenerator = async ({
	adapter,
	options,
	file,
}) => {
	const tables = getFeatureTables(options);
	const filePath = file || getMigrationFileName("init");

	const migrationExists = existsSync(path.join(process.cwd(), filePath));
	let existingContent = "";
	if (migrationExists) {
		existingContent = await fs.readFile(
			path.join(process.cwd(), filePath),
			"utf-8",
		);
	}

	// Detect many-to-many
	const manyToManyRelations = new Map();
	for (const table in tables) {
		const fields = tables[table]?.fields;
		for (const field in fields) {
			const attr = fields[field]!;
			if (attr.references) {
				const referenced = capitalizeFirstLetter(attr.references.model);
				if (!manyToManyRelations.has(referenced)) {
					manyToManyRelations.set(referenced, new Set());
				}
				manyToManyRelations.get(referenced).add(capitalizeFirstLetter(table));
			}
		}
	}

	let upCode = "";
	let downCode = "";
	// Create tables
	for (const table in tables) {
		const fields = tables[table]?.fields;
		const tableName = tables[table]?.modelName || table;

		let fieldDefs = `
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},\n`;

		for (const field in fields) {
			if (field === "id") continue;
			const attr = fields[field]!;

			const type = getSequelizeType(attr.type, attr.bigint);

			let isRequired = `${attr.required ? "allowNull: false," : ""}`;
			let isUnique = `${attr.unique ? "unique: true," : ""}`;
			let isDefault = attr.defaultValue ? `default: ${attr.defaultValue},` : "";

			fieldDefs += `
		${field}: {
			type: ${type},
			${isRequired}
			${isUnique}
			${isDefault}
		},\n`;

			// FK reference
			if (attr.references) {
				fieldDefs += `
			${attr.references.model.toLowerCase() + "Id"}: {
				type: Sequelize.INTEGER,
				references: {
					model: '${attr.references.model}',
					key: '${attr.references.field}',
				},
				onDelete: '${mapCascade(attr.references.onDelete)}',
			},\n`;
			}
		}
		//
		// 		fieldDefs += `createdAt: {
		//         type: Sequelize.DATE,
		//         allowNull: false,
		//       },
		//       updatedAt: {
		//         type: Sequelize.DATE,
		//         allowNull: false,
		//       },`;

		upCode += `
		await queryInterface.createTable("${tableName}", {
      ${fieldDefs}
    });`;

		downCode += `
		await queryInterface.dropTable("${tableName}");`;
	}

	const fullMigration = `/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		${upCode}
	},

	async down(queryInterface, Sequelize) {
		${downCode}
	}
};`;

	return {
		code: fullMigration.trim() === existingContent.trim() ? "" : fullMigration,
		fileName: filePath,
		overwrite: true,
	};
};

function getSequelizeType(type: FieldType, isBigint?: boolean): string {
	if (type === "string") return "Sequelize.STRING";
	if (type === "boolean") return "Sequelize.BOOLEAN";
	if (type === "number" && isBigint) return "Sequelize.BIGINT";
	if (type === "number") return "Sequelize.INTEGER";
	if (type === "date") return "Sequelize.DATE";
	if (type === "string[]") return "Sequelize.JSON";
	if (type === "number[]") return "Sequelize.JSON";
	return "Sequelize.STRING";
}

function mapCascade(input?: string): string {
	switch (input) {
		case "set null":
			return "SET NULL";
		case "no action":
			return "NO ACTION";
		case "set default":
			return "SET DEFAULT";
		case "restrict":
			return "RESTRICT";
		case "cascade":
		default:
			return "CASCADE";
	}
}
function getMigrationFileName(name: string) {
	const now = new Date();
	const pad = (n: number) => n.toString().padStart(2, "0");
	const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
		now.getDate(),
	)}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
	return `./migrations/${timestamp}-${name}.js`;
}
