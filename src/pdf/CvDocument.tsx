import { Document, Link, Page, Text, View } from "@react-pdf/renderer";
import { splitMarkdownSections, type MarkdownSection } from "../components/resume/markdownSection";
import { CV_CONTACT, type CvSectionConfig } from "./cvPdfSections";
import { createCvPdfStyles, type CvPdfThemeMode } from "./cvPdfTheme";

type CvDocumentProps = {
  sections: CvSectionConfig[];
  theme: CvPdfThemeMode;
  certificateUrl: string;
};

type LinkedBullet = { label: string; url: string };

function detectLinkedBullet(item: string): LinkedBullet | null {
  const match = item.match(/^([A-Za-z][A-Za-z\s]*):\s*(https?:\/\/\S+)\s*$/);
  if (!match) {
    return null;
  }

  return { label: match[1]!.trim(), url: match[2]! };
}

type CvPdfStyles = ReturnType<typeof createCvPdfStyles>;

function renderBullet(item: string, styles: CvPdfStyles) {
  const linked = detectLinkedBullet(item);

  if (linked) {
    return (
      <View style={styles.bullet} key={item}>
        <Text style={styles.bulletDot}>{">"}</Text>
        <Link src={linked.url} style={[styles.bulletText, styles.link]}>
          {linked.label}
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.bullet} key={item}>
      <Text style={styles.bulletDot}>{">"}</Text>
      <Text style={styles.bulletText}>{item}</Text>
    </View>
  );
}

function renderSkillsGrid(items: string[], styles: CvPdfStyles) {
  return (
    <View style={styles.skillsGrid}>
      {items.map((item) => (
        <View style={styles.skillsGridItem} key={item}>
          <Text style={styles.bulletDot}>{">"}</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function renderTrainingGridItem(entry: MarkdownSection, styles: CvPdfStyles) {
  return (
    <View style={styles.trainingGridItem} key={entry.title} wrap={false}>
      <Text style={styles.entryTitle}>{entry.title}</Text>
      {entry.items.map((item) => renderBullet(item, styles))}
    </View>
  );
}

function renderEntryBlock(entry: MarkdownSection, styles: CvPdfStyles, isSkills: boolean) {
  return (
    <View style={styles.entry} key={entry.title} wrap={false}>
      <Text style={styles.entryTitle}>{entry.title}</Text>
      {isSkills ? renderSkillsGrid(entry.items, styles) : entry.items.map((item) => renderBullet(item, styles))}
    </View>
  );
}

function renderSection(section: CvSectionConfig, styles: CvPdfStyles) {
  const entries = splitMarkdownSections(section.raw);
  const sectionTitle = <Text style={styles.sectionTitle}>{`// ${section.label}`}</Text>;

  if (section.id === "training") {
    // Grid rows carry two entries side by side; keep the title glued to the first
    // row so "// TRAINING" can never end up as the last line on a page.
    const [firstRow, restRows] = [entries.slice(0, 2), entries.slice(2)];

    return (
      <View style={styles.section} key={section.id}>
        <View wrap={false}>
          {sectionTitle}
          <View style={styles.trainingGrid}>
            {firstRow.map((entry) => renderTrainingGridItem(entry, styles))}
          </View>
        </View>
        {restRows.length > 0 && (
          <View style={styles.trainingGrid}>{restRows.map((entry) => renderTrainingGridItem(entry, styles))}</View>
        )}
      </View>
    );
  }

  const isSkills = section.id === "skills";
  const [firstEntry, ...restEntries] = entries;

  return (
    <View style={styles.section} key={section.id}>
      <View wrap={false}>
        {sectionTitle}
        {firstEntry && renderEntryBlock(firstEntry, styles, isSkills)}
      </View>
      {restEntries.map((entry) => renderEntryBlock(entry, styles, isSkills))}
    </View>
  );
}

export function CvDocument({ sections, theme, certificateUrl }: CvDocumentProps) {
  const styles = createCvPdfStyles(theme);

  return (
    <Document title={`${CV_CONTACT.name} - Resume`} author={CV_CONTACT.name}>
      <Page size="A4" style={styles.page}>
        <View style={styles.frame} fixed />
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.name}>{CV_CONTACT.name.toUpperCase()}</Text>
            <Text style={styles.role}>{CV_CONTACT.role}</Text>
          </View>
          <View style={styles.contactCol}>
            <Text style={styles.contactItem}>{CV_CONTACT.location}</Text>
            <Text style={styles.contactItem}>{CV_CONTACT.focus}</Text>
            <Link src={certificateUrl} style={styles.link}>
              {CV_CONTACT.englishLabel}
            </Link>
            {CV_CONTACT.links.map((link) => (
              <Link src={link.url} style={styles.link} key={link.label}>
                {link.label}
              </Link>
            ))}
            <Text style={styles.contactItem}>{CV_CONTACT.email}</Text>
          </View>
        </View>

        {sections.map((section) => renderSection(section, styles))}

        <Text
          style={styles.footer}
          fixed
          render={({ pageNumber, totalPages }) =>
            `${CV_CONTACT.name} — Resume generated on ${new Date().toLocaleDateString("en-GB")} — Page ${pageNumber}/${totalPages}`
          }
        />
      </Page>
    </Document>
  );
}
