import Link from "next/link";
import { fetchCheckout, getStoredCheckoutId } from "@/lib/checkout";
import { CheckoutForm } from "@/components/CheckoutForm";
import { PromoCodeForm } from "@/components/PromoCodeForm";
import { PaymentForm } from "@/components/PaymentForm";
import { PaypalButton } from "@/components/PaypalButton";

export default async function CheckoutPage() {
  const checkoutId = await getStoredCheckoutId();
  const checkout = checkoutId ? await fetchCheckout(checkoutId) : null;

  if (!checkout || checkout.lines.length === 0) {
    return (
      <div className="min-h-screen bg-surface-muted px-6 py-10">
        <div className="mx-auto max-w-2xl rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Nothing to check out.{" "}
            <Link href="/products" className="font-medium text-accent underline">
              Browse products
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-muted px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <nav className="mb-6 text-sm text-zinc-500">
          <Link href="/cart" className="hover:underline">
            Cart
          </Link>
          {" / "}
          <span className="text-foreground">Checkout</span>
        </nav>

        <div className="grid gap-10 sm:grid-cols-2">
          <CheckoutForm checkout={checkout} />

          <aside className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Order summary
            </h2>
            <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4">
              <div className="flex justify-between text-sm text-foreground">
                <span>Subtotal</span>
                <span>
                  {checkout.subtotalPrice.gross.amount} {checkout.subtotalPrice.gross.currency}
                </span>
              </div>
              <div className="flex justify-between text-sm text-foreground">
                <span>Shipping</span>
                <span>
                  {checkout.shippingPrice.gross.amount} {checkout.shippingPrice.gross.currency}
                </span>
              </div>
              {checkout.discount && checkout.discount.amount > 0 && (
                <div className="flex justify-between text-sm text-stock-ok-fg">
                  <span>Discount{checkout.discountName ? ` (${checkout.discountName})` : ""}</span>
                  <span>
                    -{checkout.discount.amount} {checkout.discount.currency}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 text-sm font-bold text-price">
                <span>Total</span>
                <span>
                  {checkout.totalPrice.gross.amount} {checkout.totalPrice.gross.currency}
                </span>
              </div>
            </div>

            <PromoCodeForm voucherCode={checkout.voucherCode} />

            <div className="rounded-lg border border-border bg-surface p-4">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Payment
              </h2>
              <PaymentForm amount={checkout.totalPrice.gross.amount} />
              <div className="my-2 text-center text-xs text-zinc-500">or</div>
              <PaypalButton amount={checkout.totalPrice.gross.amount} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
