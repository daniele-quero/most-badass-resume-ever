import workRaw from "../../../../data/work.data.md?raw";
import { SectionBlock } from "../SectionBlock";
import { splitMarkdownSections } from "../markdownSection";

export function WorkSection() {
  const sections = splitMarkdownSections(workRaw);

  return (
    <>
      {sections.map(({ title, items }) => (
        <SectionBlock key={title} title={title}>
          <ul className="timeline-list">
            {items.map((item) => (
              <li key={`${title}-${item}`}>{item}</li>
            ))}
          </ul>
        </SectionBlock>
      ))}
    </>
  );
}
