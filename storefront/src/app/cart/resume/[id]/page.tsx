import { redirect } from "next/navigation";
import { storeCheckoutId } from "@/lib/checkout";

// Reached from an abandoned-cart reminder email
// (backend/apps/abandoned_cart/README.md) — sets this checkout as the
// visitor's active cart, same trust level as the plain cookie the rest
// of the storefront already uses (see lib/checkout.ts's own note on
// that). Not a stronger, signed-token recovery link; a real deployment
// sending real customer data by email may want one.
export default async function ResumeCartPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await storeCheckoutId(decodeURIComponent(id));
  redirect("/cart");
}
