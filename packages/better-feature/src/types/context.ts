import type { EndpointContext, InputContext } from "better-call";
import type { FeatureContext } from "../init";

export type HookEndpointContext = EndpointContext<string, any> &
	Omit<InputContext<string, any>, "method"> & {
		context: FeatureContext & {
			returned?: unknown;
			responseHeaders?: Headers;
		};
		headers?: Headers;
	};

export type GenericEndpointContext = EndpointContext<string, any> & {
	context: FeatureContext;
};
