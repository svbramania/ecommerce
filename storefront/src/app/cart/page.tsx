import Link from "next/link";
import { fetchCheckout, getStoredCheckoutId } from "@/lib/checkout";
import { CartLineRow } from "@/components/CartLineRow";

export default async function CartPage() {
  const checkoutId = await getStoredCheckoutId();
  const checkout = checkoutId ? await fetchCheckout(checkoutId) : null;

  return (
    <div className="min-h-screen bg-surface-muted px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-2xl font-semibold text-foreground">Cart</h1>

        {!checkout || checkout.lines.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Your cart is empty.{" "}
              <Link href="/products" className="font-medium text-accent underline">
                Browse products
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {checkout.lines.map((line) => (
              <CartLineRow key={line.id} line={line} />
            ))}

            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm font-medium text-foreground">Total</span>
              <span className="text-sm font-bold text-price">
                {checkout.totalPrice.gross.amount} {checkout.totalPrice.gross.currency}
              </span>
            </div>

            <Link
              href="/checkout"
              className="mt-4 rounded-full bg-accent px-5 py-3 text-center text-sm font-medium text-accent-fg hover:bg-accent-hover"
            >
              Proceed to checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
