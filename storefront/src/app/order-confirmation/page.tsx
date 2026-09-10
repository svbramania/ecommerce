import Link from "next/link";

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ number?: string }>;
}) {
  const { number } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-6 text-center dark:bg-black">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Order placed</h1>
      {number && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Order number: {number}</p>
      )}
      <Link href="/products" className="mt-2 text-sm underline">
        Continue shopping
      </Link>
    </div>
  );
}
