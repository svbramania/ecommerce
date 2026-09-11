import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-surface-muted px-6 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Reset your password</h1>
      <ResetPasswordForm />
    </div>
  );
}
