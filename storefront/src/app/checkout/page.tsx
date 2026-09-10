import Link from "next/link";
import { fetchCheckout, getStoredCheckoutId } from "@/lib/checkout";
import { CheckoutForm } from "@/components/CheckoutForm";
import { PromoCodeForm } from "@/components/PromoCodeForm";

export default async function CheckoutPage() {
  const checkoutId = await getStoredCheckoutId();
  const checkout = checkoutId ? await fetchCheckout(checkoutId) : null;

  if (!checkout || checkout.lines.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 px-6 py-16 dark:bg-black">
        <div className="mx-auto max-w-2xl rounded-xl border border-dashed border-black/15 p-10 text-center dark:border-white/15">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Nothing to check out.{" "}
            <Link href="/products" className="font-medium underline">
              Browse products
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  // Real, not fabricated: checkout completion (checkoutComplete) needs a
  // payment gateway actually configured. Without real Stripe test keys
  // there is nothing honest to build here beyond this notice — see
  // .env.example and docs/phase-1-mvp.md.
  const stripeConfigured =
    !!process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== "sk_test_replace_me";

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="mx-auto grid max-w-4xl gap-10 sm:grid-cols-2">
        <CheckoutForm checkout={checkout} />

        <aside className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Order summary
          </h2>
          <div className="flex flex-col gap-2 rounded-lg border border-black/10 p-4 dark:border-white/10">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>
                {checkout.subtotalPrice.gross.amount} {checkout.subtotalPrice.gross.currency}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>
                {checkout.shippingPrice.gross.amount} {checkout.shippingPrice.gross.currency}
              </span>
            </div>
            {checkout.discount && checkout.discount.amount > 0 && (
              <div className="flex justify-between text-sm text-green-700 dark:text-green-400">
                <span>Discount{checkout.discountName ? ` (${checkout.discountName})` : ""}</span>
                <span>
                  -{checkout.discount.amount} {checkout.discount.currency}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-black/10 pt-2 text-sm font-medium dark:border-white/10">
              <span>Total</span>
              <span>
                {checkout.totalPrice.gross.amount} {checkout.totalPrice.gross.currency}
              </span>
            </div>
          </div>

          <PromoCodeForm voucherCode={checkout.voucherCode} />

          <div className="rounded-lg border border-dashed border-black/15 p-4 text-sm dark:border-white/15">
            {stripeConfigured ? (
              <p className="text-zinc-600 dark:text-zinc-400">
                Payment step not built yet even though a Stripe key is present — Phase 1 backlog
                item still open.
              </p>
            ) : (
              <p className="text-zinc-600 dark:text-zinc-400">
                Payment is not wired up yet — this needs a real Stripe test key in{" "}
                <code>.env</code> (see <code>STRIPE_SECRET_KEY</code> in{" "}
                <code>.env.example</code>). Nothing fake stands in for it here.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
