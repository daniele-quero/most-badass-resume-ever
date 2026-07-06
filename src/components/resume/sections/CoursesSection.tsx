import coursesRaw from "../../../../data/courses.data.md?raw";
import { SectionBlock } from "../SectionBlock";
import { extractLabeledUrl, splitMarkdownSections } from "../markdownSection";

export function CoursesSection() {
  const sections = splitMarkdownSections(coursesRaw);

  return (
    <>
      {sections.map(({ title, items }) => (
        <SectionBlock key={title} title={title}>
          <ul className="timeline-list">
            {items.map((item) => {
              const certificateUrl = extractLabeledUrl(item, "Certificate");

              if (certificateUrl) {
                return (
                  <li key={`${title}-certificate-${certificateUrl}`}>
                    <a href={certificateUrl} target="_blank" rel="noopener noreferrer">
                      Certificate
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
