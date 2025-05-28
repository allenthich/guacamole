import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
	outDir: "dist",
	externals: ["better-feature", "better-call"],
	entries: ["./src/index.ts"],
});
