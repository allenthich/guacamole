import type { BetterFeatureClientPlugin } from "better-feature";
import type { membershipLoginPlugin } from "./index";

type MyPlugin = typeof membershipLoginPlugin;

export const myClientPlugin = () => {
  return {
    id: "my-plugin",
    $InferServerPlugin: {} as ReturnType<MyPlugin>,
  } satisfies BetterFeatureClientPlugin;
};
