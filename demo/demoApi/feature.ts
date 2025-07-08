// src/server.ts

import {
	betterFeature,
	type BetterFeaturePlugin,
	type FeatureContext,
} from "better-feature";
import { sequelizeAdapter } from "better-feature/adapters/sequelize";

import { toNodeHandler } from "better-feature/node";
import express from "express";
import { Sequelize } from "sequelize";
import { defineUserModel, membershipLoginPlugin } from "../demoPlugin/src/index";

// change the dabase, user, password, host, port as needed
export const sequelize = new Sequelize("better_auth_test", "root", "toor", {
	host: "localhost",
	port: parseInt("3306"),
	dialect: "mysql",
	logging: false,
});

const User = defineUserModel(sequelize);
const db = sequelize as Sequelize & {
	models: {
		User: typeof User;
	};
};

export { db };


export const feature = betterFeature({

	basePath: "/api",
	database: sequelizeAdapter(db, {
		provider: "mysql",
	}),
	plugins: [membershipLoginPlugin()],
	context: {
		pool: db,
	},
	onAPIError: {
		throw: true,
		onError: (error, ctx) => {
			// Custom error handling
			console.error(" error:", error);
		},
	},

});


const app = express();
app.all("/api/*splat", toNodeHandler(feature)); // ✅ must follow the middleware

// // Start server
app.listen(3000, () => {
	console.log("Server is running at http://localhost:3000");
});
