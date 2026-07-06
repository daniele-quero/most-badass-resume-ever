export type MarkdownSection = {
  title: string;
  items: string[];
};

export function splitMarkdownSections(raw: string): MarkdownSection[] {
  // Ogni blocco parte da una intestazione "## ".
  return raw
    .split(/\n(?=## )/)
    .filter((section) => section.startsWith("## "))
    .map((section) => {
      const [titleLine, ...detailLines] = section.split("\n").filter(Boolean);
      const title = titleLine?.replace(/^## /, "") ?? "";
      const items = detailLines
        .map((line) => line.trim())
        .filter((line) => line.startsWith("- "))
        .map((line) => line.slice(2).trim());

      return { title, items };
    })
    .filter((section) => section.title !== "");
}

export function extractLabeledUrl(item: string, label: string): string | null {
  // Le righe "Label: https://..." diventano link corti in UI.
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = item.match(
    new RegExp(`^${escapedLabel}:\\s*(https?:\\/\\/\\S+)\\s*$`, "i")
  );

  return match?.[1] ?? null;
}
