import { forwardRef, type InputHTMLAttributes } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...props }, ref) {
    return (
      <input
        ref={ref}
        className={`rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground ${className}`}
        {...props}
      />
    );
  },
);
