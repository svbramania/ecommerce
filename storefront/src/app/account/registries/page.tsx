import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCustomerToken } from "@/lib/auth";
import { listMyRegistries } from "@/lib/giftRegistry";
import { CreateRegistryForm } from "@/components/CreateRegistryForm";
import { DeleteRegistryButton } from "@/components/DeleteRegistryButton";

export const metadata: Metadata = {
  title: "Your Registries",
};

export default async function RegistriesPage() {
  const token = await getCustomerToken();
  if (!token) redirect("/login");

  const registries = await listMyRegistries(token);

  return (
    <div className="min-h-screen bg-surface-muted px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">Your Registries & Gift Lists</h1>
          <Link href="/account" className="text-sm text-accent underline">
            &larr; Back to account
          </Link>
        </div>

        <div className="mb-8 rounded-lg border border-border bg-surface p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Create a registry
          </h2>
          <CreateRegistryForm />
        </div>

        {registries.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No registries yet — create one above to start adding products and share it with
            anyone, even people without an account here.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {registries.map((registry) => (
              <li
                key={registry.id}
                className="flex items-center justify-between rounded-lg border border-border bg-surface p-4"
              >
                <div>
                  <Link
                    href={`/account/registries/${registry.id}`}
                    className="font-medium text-foreground hover:underline"
                  >
                    {registry.title}
                  </Link>
                  <p className="text-xs text-zinc-500">
                    {registry.items.length} item{registry.items.length === 1 ? "" : "s"}
                    {registry.eventDate ? ` · ${registry.eventDate}` : ""}
                  </p>
                </div>
                <DeleteRegistryButton registryId={registry.id} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
