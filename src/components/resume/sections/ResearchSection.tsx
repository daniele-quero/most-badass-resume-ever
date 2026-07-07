import researchRaw from "../../../../data/research.data.md?raw";
import { SectionBlock } from "../SectionBlock";
import { extractLabeledUrl, splitMarkdownSections } from "../markdownSection";

export function ResearchSection() {
  const sections = splitMarkdownSections(researchRaw);

  return (
    <>
      {sections.map(({ title, items }) => (
        <SectionBlock key={title} title={title}>
          <ul className="timeline-list">
            {items.map((item) => {
              const articleUrl =
                extractLabeledUrl(item, "Article link") ?? extractLabeledUrl(item, "Link");

              if (articleUrl) {
                return (
                  <li key={`${title}-link-${articleUrl}`}>
                    <a href={articleUrl} target="_blank" rel="noopener noreferrer">
                      Link
                    </a>
                  </li>
                );
              }

              return <li key={`${title}-${item}`}>{item}</li>;
            })}
          </ul>
        </SectionBlock>
      ))}
    </>
  );
}
