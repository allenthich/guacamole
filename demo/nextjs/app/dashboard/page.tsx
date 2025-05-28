import { feature } from "@/lib/feature";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import UserCard from "./user-card";
import { OrganizationCard } from "./organization-card";
import AccountSwitcher from "@/components/account-switch";

export default async function DashboardPage() {
	const [session, activeSessions, deviceSessions, organization, subscriptions] =
		await Promise.all([
			feature.api.getSession({
				headers: await headers(),
			}),
			feature.api.listSessions({
				headers: await headers(),
			}),
			feature.api.listDeviceSessions({
				headers: await headers(),
			}),
			feature.api.getFullOrganization({
				headers: await headers(),
			}),
			feature.api.listActiveSubscriptions({
				headers: await headers(),
			}),
		]).catch((e) => {
			console.log(e);
			throw redirect("/sign-in");
		});
	return (
		<div className="w-full">
			<div className="flex gap-4 flex-col">
				<AccountSwitcher
					sessions={JSON.parse(JSON.stringify(deviceSessions))}
				/>
				<UserCard
					session={JSON.parse(JSON.stringify(session))}
					activeSessions={JSON.parse(JSON.stringify(activeSessions))}
					subscription={subscriptions.find(
						(sub) => sub.status === "active" || sub.status === "trialing",
					)}
				/>
				<OrganizationCard
					session={JSON.parse(JSON.stringify(session))}
					activeOrganization={JSON.parse(JSON.stringify(organization))}
				/>
			</div>
		</div>
	);
}
