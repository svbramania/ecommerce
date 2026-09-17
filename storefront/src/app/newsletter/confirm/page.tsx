import Link from "next/link";
import type { Metadata } from "next";
import { confirmNewsletterAction } from "@/app/actions/newsletter";

export const metadata: Metadata = {
  title: "Confirm Newsletter Signup",
};

export default async function ConfirmNewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; token?: string }>;
}) {
  const { email, token } = await searchParams;

  if (!email || !token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-muted px-6">
        <p className="text-sm text-red-600 dark:text-red-400">
          Missing confirmation link parameters.
        </p>
      </div>
    );
  }

  const result = await confirmNewsletterAction(email, token);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-muted px-6 text-center">
      {result.ok ? (
        <>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            You&apos;re subscribed — thanks for confirming.
          </p>
          <Link
            href="/"
            className="rounded-full bg-accent px-5 py-2 text-sm text-accent-fg hover:bg-accent-hover"
          >
            Continue shopping
          </Link>
        </>
      ) : (
        <p className="text-sm text-red-600 dark:text-red-400">
          Could not confirm: {result.error}
        </p>
      )}
    </div>
  );
}
