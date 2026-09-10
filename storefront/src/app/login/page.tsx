import Link from "next/link";
import { login } from "@/app/actions/auth";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-zinc-50 px-6 py-16 dark:bg-black">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Log in</h1>
      <AuthForm mode="login" action={login} />
      <p className="text-sm text-zinc-500">
        <Link href="/reset-password" className="underline">
          Forgot password?
        </Link>{" "}
        &middot;{" "}
        <Link href="/register" className="underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
