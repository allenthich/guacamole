import { betterAuth } from "better-auth";
import { tester } from "better-auth/plugins";
import { LibsqlDialect } from "@libsql/kysely-libsql";
import { MysqlDialect } from "kysely";
import { createPool } from "mysql2/promise";

const from = process.env.BETTER_AUTH_EMAIL || "delivered@resend.dev";
const to = process.env.TEST_EMAIL || "";

const libsql = new LibsqlDialect({
	url: process.env.TURSO_DATABASE_URL || "",
	authToken: process.env.TURSO_AUTH_TOKEN || "",
});

const mysql = process.env.USE_MYSQL
	? new MysqlDialect(createPool(process.env.MYSQL_DATABASE_URL || ""))
	: null;

const dialect = process.env.USE_MYSQL ? mysql : libsql;

if (!dialect) {
	throw new Error("No dialect found");
}

export const auth = betterAuth({
	appName: "Better Auth Demo",
	database: {
		dialect,
		type: process.env.USE_MYSQL ? "mysql" : "sqlite",
	},
	plugins: [tester()],
	trustedOrigins: ["exp://"],
});
