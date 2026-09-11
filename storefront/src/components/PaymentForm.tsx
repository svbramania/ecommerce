"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import {
  initializePayment,
  chargeAndCompleteCheckout,
  completeAfterAction,
} from "@/app/actions/payment";

function CardForm({ amount }: { amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setError(null);

        startTransition(async () => {
          const card = elements.getElement(CardElement);
          if (!card) return;

          // Card details go straight from this element to Stripe via
          // stripe.createPaymentMethod — only the resulting id (never the
          // card number/CVC) is sent to our own server action below.
          const { paymentMethod, error: stripeError } = await stripe.createPaymentMethod({
            type: "card",
            card,
          });

          if (stripeError || !paymentMethod) {
            setError(stripeError?.message ?? "Could not process card.");
            return;
          }

          let result = await chargeAndCompleteCheckout(paymentMethod.id, amount);

          if (!result.ok && "requiresAction" in result) {
            // 3D Secure: Stripe.js drives the challenge (a modal or
            // redirect it manages) using the same client_secret our
            // payment app got back from Stripe's PaymentIntent.
            const { error: confirmError } = await stripe.confirmCardPayment(
              result.clientSecret
            );
            if (confirmError) {
              setError(confirmError.message ?? "3D Secure verification failed.");
              return;
            }
            result = await completeAfterAction(result.transactionId);
          }

          if (!result.ok) {
            setError("error" in result ? result.error : "Additional action required again.");
            return;
          }

          router.push(`/order-confirmation?number=${result.orderNumber}`);
        });
      }}
    >
      <div className="rounded border border-black/15 p-3 dark:border-white/15">
        <CardElement options={{ style: { base: { fontSize: "14px" } } }} />
      </div>
      <button
        type="submit"
        disabled={!stripe || isPending}
        className="rounded-full bg-black px-5 py-3 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {isPending ? "Charging…" : `Pay ${amount.toFixed(2)}`}
      </button>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <p className="text-xs text-zinc-500">
        Test mode — 4242 4242 4242 4242 for an instant charge, or 4000 0027 6000 3184 to see the
        3D Secure challenge. Any future expiry, any CVC.
      </p>
    </form>
  );
}

export function PaymentForm({ amount }: { amount: number }) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializePayment().then((result) => {
      if (result.ok) {
        setStripePromise(loadStripe(result.publishableKey));
      } else {
        setError(result.error);
      }
    });
  }, []);

  if (error) {
    return <p className="text-sm text-red-600 dark:text-red-400">Payment unavailable: {error}</p>;
  }

  if (!stripePromise) {
    return <p className="text-sm text-zinc-500">Loading payment form…</p>;
  }

  return (
    <Elements stripe={stripePromise}>
      <CardForm amount={amount} />
    </Elements>
  );
}
