import { getDate } from "../utils/date";
import { getWithHooks } from "./with-hooks";
import { getIp } from "../utils/get-request-ip";
import { safeJSONParse } from "../utils/json";
import { generateId } from "../utils";
import type {
	Adapter,
	AuthContext,
	BetterAuthOptions,
	GenericEndpointContext,
	Where,
} from "../types";

export const createInternalAdapter = (
	adapter: Adapter,
	ctx: {
		options: BetterAuthOptions;
		hooks: Exclude<BetterAuthOptions["databaseHooks"], undefined>[];
		generateId: AuthContext["generateId"];
	},
) => {
	const options = ctx.options;
	const { createWithHooks, updateWithHooks, updateManyWithHooks } =
		getWithHooks(adapter, ctx);

	return {};
};

export type InternalAdapter = ReturnType<typeof createInternalAdapter>;
