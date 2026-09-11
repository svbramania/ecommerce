import Link from "next/link";
import { completePaypalCheckout } from "@/app/actions/paypal";

export default async function PaypalReturnPage() {
  const result = await completePaypalCheckout();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-muted px-6 text-center">
      {result.ok ? (
        <>
          <h1 className="text-2xl font-semibold text-foreground">Order placed</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Order number: {result.orderNumber}
          </p>
          <Link href="/products" className="mt-2 text-sm text-accent underline">
            Continue shopping
          </Link>
        </>
      ) : (
        <>
          <p className="text-sm text-red-600 dark:text-red-400">
            Could not complete the PayPal payment: {result.error}
          </p>
          <Link href="/checkout" className="mt-2 text-sm text-accent underline">
            Back to checkout
          </Link>
        </>
      )}
    </div>
  );
}
