import skillsRaw from "../../../../data/skills.data.md?raw";
import { AiHoursPerk } from "../AiHoursPerk";
import { SectionBlock } from "../SectionBlock";
import { splitMarkdownSections } from "../markdownSection";

export function SkillsSection() {
  const sections = splitMarkdownSections(skillsRaw);

  return (
    <>
      {sections.map(({ title, items }) => (
        <SectionBlock key={title} title={title}>
          <ul
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              columnGap: "1.5rem",
              rowGap: "0.45rem"
            }}
          >
            {items.map((item) => (
              <li key={`${title}-${item}`}>{item}</li>
            ))}
          </ul>
          {title.trim() === "AI Skills" && <AiHoursPerk />}
        </SectionBlock>
      ))}
    </>
  );
}
