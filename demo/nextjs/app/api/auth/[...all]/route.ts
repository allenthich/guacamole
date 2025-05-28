import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-feature/next-js";
import { NextRequest } from "next/server";

export const { GET } = toNextJsHandler(auth);

export const POST = async (req: NextRequest) => {
	const res = await auth.handler(req);
	return res;
};
