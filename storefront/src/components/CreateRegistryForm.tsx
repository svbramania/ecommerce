"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRegistryAction } from "@/app/actions/giftRegistry";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function CreateRegistryForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await createRegistryAction(title, eventDate || undefined);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setTitle("");
      setEventDate("");
      router.refresh();
    });
  }

  return (
    <form
      action={submit}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="registry-title" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Title
        </label>
        <Input
          id="registry-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Our Housewarming Registry"
          required
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="registry-date" className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Event date (optional)
        </label>
        <Input
          id="registry-date"
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating…" : "Create"}
      </Button>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}
