import { redirect } from "next/navigation";
import { authedClient, getCustomerToken } from "@/lib/auth";
import { CurrentUserDocument, CurrentUserOrdersDocument } from "@/gql/generated/graphql";
import { LogoutButton } from "@/components/LogoutButton";

export default async function AccountPage() {
  const token = await getCustomerToken();
  if (!token) redirect("/login");

  const client = authedClient(token);
  const result = await client.query(CurrentUserDocument, {}).toPromise();
  const user = result.data?.me;

  // A stale/expired token still passes the cookie-presence check above but
  // fails the actual query — send back to login rather than showing a
  // broken page.
  if (!user) redirect("/login");

  const ordersResult = await client.query(CurrentUserOrdersDocument, {}).toPromise();
  const orders = ordersResult.data?.me?.orders?.edges.map((e) => e.node) ?? [];

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

      <div className="w-full max-w-sm">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Order history
        </h2>
        {orders.length === 0 ? (
          <p className="text-sm text-zinc-500">No orders yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {orders.map((order) => (
              <li
                key={order.id}
                className="flex items-center justify-between rounded-lg border border-black/10 p-3 text-sm dark:border-white/10"
              >
                <div>
                  <p className="font-medium text-black dark:text-zinc-50">Order #{order.number}</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(order.created as string).toLocaleDateString()} &middot; {order.status}
                    {order.isPaid ? " · Paid" : ""}
                  </p>
                </div>
                <span className="font-medium text-black dark:text-zinc-50">
                  {order.total.gross.amount} {order.total.gross.currency}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <LogoutButton />
    </div>
  );
}
