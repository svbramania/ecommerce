"use client";

import { useState, useTransition } from "react";
import { selectDeliveryMethod, updateEmail, updateShippingAddress } from "@/app/actions/checkout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { CheckoutFieldsFragment, CountryCode } from "@/gql/generated/graphql";

export function CheckoutForm({ checkout }: { checkout: CheckoutFieldsFragment }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [email, setEmail] = useState(checkout.email ?? "");
  const [address, setAddress] = useState({
    firstName: checkout.shippingAddress?.firstName ?? "",
    lastName: checkout.shippingAddress?.lastName ?? "",
    streetAddress1: checkout.shippingAddress?.streetAddress1 ?? "",
    city: checkout.shippingAddress?.city ?? "",
    postalCode: checkout.shippingAddress?.postalCode ?? "",
    country: checkout.shippingAddress?.country?.code ?? "US",
    countryArea: "",
  });

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      setMessage(result.ok ? "Saved." : `Error: ${result.error}`);
    });
  }

  return (
    <div className="flex flex-col gap-8 rounded-lg border border-border bg-surface p-6">
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Contact</h2>
        <div className="flex gap-2">
          <label htmlFor="checkout-email" className="sr-only">
            Email
          </label>
          <Input
            id="checkout-email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          <Button type="button" variant="primary" disabled={isPending} onClick={() => run(() => updateEmail(email))}>
            Save
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Shipping address
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["firstName", "First name"],
              ["lastName", "Last name"],
              ["streetAddress1", "Street address"],
              ["city", "City"],
              ["postalCode", "Postal code"],
              ["country", "Country code (e.g. US)"],
              ["countryArea", "State/province (required by some countries)"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex flex-col gap-1">
              <label htmlFor={`address-${key}`} className="sr-only">
                {label}
              </label>
              <Input
                id={`address-${key}`}
                placeholder={label}
                value={address[key]}
                onChange={(e) => setAddress((a) => ({ ...a, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          disabled={isPending}
          onClick={() =>
            run(() =>
              updateShippingAddress({
                firstName: address.firstName,
                lastName: address.lastName,
                streetAddress1: address.streetAddress1,
                city: address.city,
                postalCode: address.postalCode,
                countryArea: address.countryArea,
                // A raw text input, not a validated dropdown yet — an
                // invalid code surfaces as a real error from Saleor via
                // the message state below rather than failing silently.
                country: address.country as CountryCode,
              })
            )
          }
          className="self-start"
        >
          Save address
        </Button>
      </section>

      {checkout.shippingMethods.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Shipping method
          </h2>
          {checkout.shippingMethods.map((method) => (
            <button
              key={method.id}
              type="button"
              disabled={isPending}
              onClick={() => run(() => selectDeliveryMethod(method.id))}
              className="flex items-center justify-between rounded-md border border-border p-3 text-left text-sm text-foreground hover:border-accent"
            >
              <span>{method.name}</span>
              <span>
                {method.price.amount} {method.price.currency}
              </span>
            </button>
          ))}
        </section>
      )}

      {message && (
        <p role="status" className="text-sm text-zinc-600 dark:text-zinc-400">
          {message}
        </p>
      )}
    </div>
  );
}
