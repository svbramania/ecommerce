import Link from "next/link";

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ number?: string }>;
}) {
  const { number } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-muted px-6 text-center">
      <h1 className="text-2xl font-semibold text-foreground">Order placed</h1>
      {number && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Order number: {number}</p>
      )}
      <Link href="/products" className="mt-2 text-sm text-accent underline">
        Continue shopping
      </Link>
    </div>
  );
}
