import { auth } from "$lib/auth";
import { svelteKitHandler } from "better-feature/svelte-kit";

export async function handle({ event, resolve }) {
	return svelteKitHandler({ event, resolve, auth });
}
