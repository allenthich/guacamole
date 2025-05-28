import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
	outDir: "dist",
	externals: ["@allenthich/better-feature", "better-call"],
	entries: ["./src/index.ts"],
});
