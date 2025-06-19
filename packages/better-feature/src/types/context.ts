import type { EndpointContext, InputContext } from "better-call";
import type { FeatureContext, DBInstance } from "../init"; // Import DBInstance

// Make HookEndpointContext generic
export type HookEndpointContext<DatabaseType extends DBInstance = DBInstance> = EndpointContext<string, any> &
	Omit<InputContext<string, any>, "method"> & {
		context: FeatureContext<DatabaseType> & { // Use generic FeatureContext
			returned?: unknown;
			responseHeaders?: Headers;
		};
		headers?: Headers;
	};

// Make GenericEndpointContext generic
export type GenericEndpointContext<DatabaseType extends DBInstance = DBInstance> = EndpointContext<string, any> & {
	context: FeatureContext<DatabaseType>; // Use generic FeatureContext
};
