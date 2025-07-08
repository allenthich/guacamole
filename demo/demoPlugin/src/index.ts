import type {
	BetterFeaturePlugin
} from "better-feature";
import { createFeatureEndpoint } from "better-feature/api";
import z from "zod";

import { DataTypes, Model, Sequelize } from "sequelize";

export class User extends Model {
	declare membershipId?: string;
	declare membershipLevel?: string;
	declare password?: string;
	declare createdAt?: Date;
	declare updatedAt?: Date;
}

export const defineUserModel = (sequelize: Sequelize): typeof User => {
	User.init(
		{
			membershipId: {
				type: DataTypes.INTEGER.UNSIGNED,
				autoIncrement: true,
				primaryKey: true,
			},
			membershipLevel: {
				type: DataTypes.STRING(100),
				allowNull: false,
				unique: true,
			},
			password: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			createdAt: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
			updatedAt: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
		},
		{
			sequelize, // ⬅️ passed in
			tableName: "user",
			modelName: "User",
			timestamps: true,
			underscored: false,
		},
	);

	return User;
};

export const membershipLoginPlugin = (): BetterFeaturePlugin => ({
	id: "membership",
	hooks: {
		before: [
			{
				matcher: (context) => {
					const pool = context.context.options?.context.pool;
					if (!pool) throw new Error("Database pool not found");
					db = getModelTypedDb(pool as Sequelize);
					return true;
				},
				handler: async (ctx) => {
					return { context: ctx };
				},
			},
		],
		// after: [
		// 	{
		// 		matcher: (context) => {
		// 			console.log(context.body);
		// 			return context.path === "/membership/login";
		// 		},
		// 		handler: async (context) => {
		// 			console.log("zzzz", context);
		// 			return (context.context.returned = {
		// 				...context.context.returned,
		// 				akash: "this is data",
		// 			});
		// 		},
		// 	},
		// ],
	},
	schema: {
		test: {
			fields: {
				membershipId: { type: "string", required: true, unique: true },
				membershipLevel: { type: "string", required: false },
				password: {
					type: "string",
					required: true,
					defaultValue: "'1234afsd'",
				},
				createdAt: { type: "date", defaultValue: "Sequelize.NOW" },
				updatedAt: { type: "date", defaultValue: "Sequelize.NOW" },
			},
			modelName: "test",
		},
	},

	endpoints: {
		login: createFeatureEndpoint(
			"/membership/login",
			{
				method: "POST",
				body: z.object({
					membershipId: z.string(),
					password: z.string(),
				}),
				response: {
					token: "string",
					user: {
						membershipId: "string",
						membershipLevel: "string",
					},
				},
			},
			async (ctx) => {
				const { membershipId, password } = ctx.body;

				const database = await db.models.User.findOne({
					// attributes: ["membershipId"],
					where: {
						membershipId: membershipId,
					},
				});

				if (!database || password !== database.password) {
					throw new Error("Invalid credentials");
				}

				if (
					membershipId !== database.membershipId ||
					password !== database.password
				) {
					throw new Error("Invalid membershipId or password");
				}

				const token = "mock-token-123";

				return ctx.json({
					token,
					user: {
						membershipId: database.membershipId,
						membershipLevel: database.membershipLevel,
					},
				});
			},
		),

		hello: createFeatureEndpoint(
			"/test",
			{
				method: "GET",
				response: { message: "string" },
			},
			async (ctx) => {
				return ctx.json({ message: "Hello from membership plugin" });
			},
		),
	},
});

let db: Sequelize & {
	models: {
		User: typeof User;
	};
};
const getModelTypedDb = (db: Sequelize) => {
	const User = defineUserModel(db);
	return db as Sequelize & {
		models: {
			User: typeof User;
		};
	};
};
