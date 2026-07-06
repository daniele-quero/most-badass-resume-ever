import gamefolioRaw from "../../../../data/gamefolio.data.md?raw";
import { SectionBlock } from "../SectionBlock";
import { extractLabeledUrl, splitMarkdownSections } from "../markdownSection";

export function GamesSection() {
  const sections = splitMarkdownSections(gamefolioRaw);

  return (
    <>
      {sections.map(({ title, items }) => (
        <SectionBlock key={title} title={title}>
          <ul className="timeline-list">
            {items.map((item) => {
              const gameUrl = extractLabeledUrl(item, "Link");

              if (gameUrl) {
                return (
                  <li key={`${title}-game-${gameUrl}`}>
                    <a href={gameUrl} target="_blank" rel="noopener noreferrer">
                      Game
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
