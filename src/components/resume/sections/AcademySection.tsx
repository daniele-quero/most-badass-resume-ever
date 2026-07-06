import academyRaw from "../../../../data/academy.data.md?raw";
import { SectionBlock } from "../SectionBlock";
import { splitMarkdownSections } from "../markdownSection";

export function AcademySection() {
  const sections = splitMarkdownSections(academyRaw);

  return (
    <>
      {sections.map(({ title, items }) => (
        <SectionBlock key={title} title={title}>
          <ul>
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </SectionBlock>
      ))}
    </>
  );
}
