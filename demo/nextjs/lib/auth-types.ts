import type { feature } from "./feature";
import { client } from "./feature-client";

export type Session = typeof feature.$Infer.Session;
export type ActiveOrganization = typeof client.$Infer.ActiveOrganization;
export type Invitation = typeof client.$Infer.Invitation;
