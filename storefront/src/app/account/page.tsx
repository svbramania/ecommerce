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
    <div className="flex min-h-screen flex-col items-center gap-6 bg-surface-muted px-6 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Account</h1>
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-4 text-sm">
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
                className="rounded-lg border border-border bg-surface p-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Order #{order.number}</p>
                    <p className="text-xs text-zinc-500">
                      {new Date(order.created as string).toLocaleDateString()} &middot; {order.status}
                      {order.isPaid ? " · Paid" : ""}
                    </p>
                  </div>
                  <span className="font-bold text-price">
                    {order.total.gross.amount} {order.total.gross.currency}
                  </span>
                </div>

                <details className="mt-2">
                  <summary className="cursor-pointer text-xs font-medium text-accent">
                    Track package
                  </summary>
                  <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                    {!order.fulfillments || order.fulfillments.length === 0 ? (
                      <p>Not yet fulfilled.</p>
                    ) : (
                      <ul className="flex flex-col gap-1">
                        {order.fulfillments.map((f, i) => (
                          <li key={i}>
                            {f?.status}
                            {f?.trackingNumber ? ` · Tracking: ${f.trackingNumber}` : ""}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </div>

      <LogoutButton />
    </div>
  );
}
