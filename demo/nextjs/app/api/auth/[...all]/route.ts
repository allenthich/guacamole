import { feature } from "@/lib/feature";
import { toNextJsHandler } from "better-feature/next-js";
import { NextRequest } from "next/server";

export const { GET } = toNextJsHandler(feature);

export const POST = async (req: NextRequest) => {
	const res = await feature.handler(req);
	return res;
};
