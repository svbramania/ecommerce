import { redirect } from "next/navigation";
import { authedClient, getCustomerToken } from "@/lib/auth";
import { CurrentUserDocument } from "@/gql/generated/graphql";
import { LogoutButton } from "@/components/LogoutButton";

export default async function AccountPage() {
  const token = await getCustomerToken();
  if (!token) redirect("/login");

  const result = await authedClient(token).query(CurrentUserDocument, {}).toPromise();
  const user = result.data?.me;

  // A stale/expired token still passes the cookie-presence check above but
  // fails the actual query — send back to login rather than showing a
  // broken page.
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-zinc-50 px-6 py-16 dark:bg-black">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Account</h1>
      <div className="w-full max-w-sm rounded-lg border border-black/10 p-4 text-sm dark:border-white/10">
        <p>
          <span className="text-zinc-500">Email:</span> {user.email}
        </p>
        {(user.firstName || user.lastName) && (
          <p>
            <span className="text-zinc-500">Name:</span> {user.firstName} {user.lastName}
          </p>
        )}
      </div>
      {/* Order history is a real follow-up, not built yet — it needs at
          least one completed order to show, and order completion is
          blocked on Stripe keys (see docs/phase-1-mvp.md). */}
      <LogoutButton />
    </div>
  );
}
