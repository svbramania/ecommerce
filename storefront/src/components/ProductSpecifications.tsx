import type { ReactNode } from "react";
import { RichText } from "@/components/RichText";
import type { ProductDetailQuery } from "@/gql/generated/graphql";

type Product = NonNullable<ProductDetailQuery["product"]>;
type AssignedAttributeRow = Product["assignedAttributes"][number];

function formatWeight(weight?: { value: number; unit: string } | null) {
  if (!weight) return null;
  return `${weight.value} ${weight.unit.toLowerCase()}`;
}

function formatDate(value: unknown) {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

// Amazon-style "Product information" table — but every row is a real
// Saleor field, and a row is simply omitted when that field is empty
// rather than filled with a placeholder. Reference/date/file/swatch
// attribute types aren't rendered (no product in this catalog uses them
// yet); add a case here if a staff member assigns one later.
function attributeRowValue(row: AssignedAttributeRow): ReactNode {
  switch (row.__typename) {
    case "AssignedPlainTextAttribute":
      return "plainTextValue" in row ? row.plainTextValue || null : null;
    case "AssignedTextAttribute":
      return "richTextValue" in row && row.richTextValue ? (
        <RichText json={row.richTextValue} />
      ) : null;
    case "AssignedSingleChoiceAttribute":
      return "choiceValue" in row ? (row.choiceValue?.name ?? null) : null;
    case "AssignedMultiChoiceAttribute":
      return "multiChoiceValue" in row && row.multiChoiceValue && row.multiChoiceValue.length > 0
        ? row.multiChoiceValue.map((v) => v.name).filter(Boolean).join(", ")
        : null;
    case "AssignedNumericAttribute":
      return "numericValue" in row && row.numericValue != null ? String(row.numericValue) : null;
    case "AssignedBooleanAttribute":
      return "booleanValue" in row && row.booleanValue != null ? (row.booleanValue ? "Yes" : "No") : null;
    default:
      return null;
  }
}

export function ProductSpecifications({
  sku,
  category,
  created,
  weight,
  assignedAttributes,
}: {
  sku?: string | null;
  category?: { name: string } | null;
  created?: unknown;
  weight?: { value: number; unit: string } | null;
  assignedAttributes?: AssignedAttributeRow[] | null;
}) {
  const rows: { label: string; value: ReactNode }[] = [];

  if (category?.name) rows.push({ label: "Category", value: category.name });
  if (sku) rows.push({ label: "Item model number", value: sku });
  const dateFirstAvailable = formatDate(created);
  if (dateFirstAvailable) rows.push({ label: "Date first available", value: dateFirstAvailable });
  const weightLabel = formatWeight(weight);
  if (weightLabel) rows.push({ label: "Item weight", value: weightLabel });

  for (const row of assignedAttributes ?? []) {
    if (!row.attribute.visibleInStorefront) continue;
    const value = attributeRowValue(row);
    if (value == null || value === "") continue;
    rows.push({ label: row.attribute.name, value });
  }

  if (rows.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-foreground">Product information</h2>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? "bg-surface" : "bg-surface-muted"}>
                <th
                  scope="row"
                  className="w-1/3 border-r border-border px-4 py-2 text-left font-medium text-foreground"
                >
                  {row.label}
                </th>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
