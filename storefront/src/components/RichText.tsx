// Renders Saleor's product/category "description" field, which is
// EditorJS JSON, not HTML or markdown. Security-checklist item
// sf-sanitize: rather than converting blocks to an HTML string and then
// sanitizing it, this walks the JSON and builds React elements directly —
// text content goes through React's own escaping, and any block type or
// field this doesn't explicitly recognize is simply skipped, not passed
// through. There is no dangerouslySetInnerHTML anywhere in this file.
type EditorJsBlock = {
  type?: string;
  data?: {
    text?: unknown;
    level?: unknown;
    style?: unknown;
    items?: unknown;
  };
};

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

// EditorJS inline formatting comes through as raw HTML-like tags (<b>,
// <i>, <a>) inside the text string — stripped here rather than rendered,
// since rendering them safely would need the same sanitizer this
// component exists to avoid depending on. Plain text only, for now.
function stripInlineMarkup(text: string): string {
  return text.replace(/<[^>]*>/g, "");
}

export function RichText({ json }: { json: unknown }) {
  let parsed: { blocks?: EditorJsBlock[] } | null = null;
  try {
    parsed = typeof json === "string" ? JSON.parse(json) : null;
  } catch {
    parsed = null;
  }

  const blocks = Array.isArray(parsed?.blocks) ? parsed.blocks : [];
  if (blocks.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 text-sm text-zinc-600 dark:text-zinc-400">
      {blocks.map((block, i) => {
        const text = stripInlineMarkup(asString(block.data?.text));
        switch (block.type) {
          case "header": {
            const level = Number(block.data?.level);
            const Tag = (level >= 1 && level <= 6 ? `h${level}` : "h2") as
              | "h1"
              | "h2"
              | "h3"
              | "h4"
              | "h5"
              | "h6";
            return (
              <Tag key={i} className="font-semibold text-black dark:text-zinc-50">
                {text}
              </Tag>
            );
          }
          case "paragraph":
            return text ? <p key={i}>{text}</p> : null;
          case "list": {
            const items = Array.isArray(block.data?.items) ? block.data!.items : [];
            const ListTag = block.data?.style === "ordered" ? "ol" : "ul";
            return (
              <ListTag key={i} className="list-inside list-disc pl-2">
                {items.map((item, j) => (
                  <li key={j}>{stripInlineMarkup(asString(item))}</li>
                ))}
              </ListTag>
            );
          }
          default:
            // An unrecognized block type is dropped, not rendered as raw
            // markup — the safe default for content this hasn't been
            // taught to handle.
            return null;
        }
      })}
    </div>
  );
}
