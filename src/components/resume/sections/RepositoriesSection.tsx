import repofolioRaw from "../../../../data/repofolio.data.md?raw";
import { SectionBlock } from "../SectionBlock";
import { extractLabeledUrl, splitMarkdownSections } from "../markdownSection";

export function RepositoriesSection() {
  const sections = splitMarkdownSections(repofolioRaw);

  return (
    <>
      {sections.map(({ title, items }) => (
        <SectionBlock key={title} title={title}>
          <ul className="timeline-list">
            {items.map((item) => {
              const repoUrl = extractLabeledUrl(item, "Link");

              if (repoUrl) {
                return (
                  <li key={`${title}-repo-${repoUrl}`}>
                    <a href={repoUrl} target="_blank" rel="noopener noreferrer">
                      Repo
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
