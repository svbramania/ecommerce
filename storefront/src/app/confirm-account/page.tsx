import Link from "next/link";
import { confirmAccount } from "@/app/actions/auth";

export default async function ConfirmAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; token?: string }>;
}) {
  const { email, token } = await searchParams;

  if (!email || !token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-6 dark:bg-black">
        <p className="text-sm text-red-600 dark:text-red-400">
          Missing confirmation link parameters.
        </p>
      </div>
    );
  }

  const result = await confirmAccount(email, token);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-6 text-center dark:bg-black">
      {result.ok ? (
        <>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            Email confirmed — you can log in now.
          </p>
          <Link href="/login" className="rounded-full bg-black px-5 py-2 text-sm text-white dark:bg-white dark:text-black">
            Log in
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
