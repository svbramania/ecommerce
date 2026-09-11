import Link from "next/link";
import { register } from "@/app/actions/auth";
import { AuthForm } from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-surface-muted px-6 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Create an account</h1>
      <AuthForm mode="register" action={register} />
      <p className="text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="text-accent underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
