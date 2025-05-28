export class BetterFeatureError extends Error {
	constructor(message: string, cause?: string) {
		super(message);
		this.name = "BetterFeatureError";
		this.message = message;
		this.cause = cause;
		this.stack = "";
	}
}
export class MissingDependencyError extends BetterFeatureError {
	constructor(pkgName: string) {
		super(
			`The package "${pkgName}" is required. Make sure it is installed.`,
			pkgName,
		);
	}
}
