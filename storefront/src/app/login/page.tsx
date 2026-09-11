import Link from "next/link";
import { login } from "@/app/actions/auth";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-surface-muted px-6 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Log in</h1>
      <AuthForm mode="login" action={login} />
      <p className="text-sm text-zinc-500">
        <Link href="/reset-password" className="text-accent underline">
          Forgot password?
        </Link>{" "}
        &middot;{" "}
        <Link href="/register" className="text-accent underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
